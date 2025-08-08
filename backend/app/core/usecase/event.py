from collections import defaultdict
from datetime import date, datetime
from zoneinfo import ZoneInfo

import httpx

from app.core.constants.constants import ML_SERVER_URL
from app.core.domain.entities.event import Event as EventEntity
from app.core.domain.entities.event import (
    EventAttendanceActionLog as EventAttendanceActionLogEntity,
)
from app.core.domain.entities.event import (
    EventAttendanceForecast as EventAttendanceForecastEntity,
)
from app.core.domain.usecase.base import IUsecase
from app.core.dtos.event import Attendance as AttendanceDto
from app.core.dtos.event import AttendancesWithUsername as AttendancesWithUsernameDto
from app.core.dtos.event import AttendanceTimeForecast as AttendanceTimeForecastDto
from app.core.dtos.event import (
    AttendanceTimeForecastsWithUsername as AttendanceTimeForecastsWithUsernameDto,
)
from app.core.dtos.event import (
    AttendEventResponse,
    CreateEventResponse,
    ForecastAttendanceTimeResponse,
    GetAttendanceHistoryResponse,
    GetAttendanceTimeForecastsResponse,
    GetFollowingEventsResponse,
    GetGuestAttendanceStatusResponse,
    GetMyEventsResponse,
    UpdateAttendancesResponse,
    UpdateEventResponse,
)
from app.core.dtos.event import Event as EventDto
from app.core.dtos.event import EventWithId as EventWithIdDto
from app.core.dtos.ml_dto.account import UserAccount as UserAccountMLDto
from app.core.dtos.ml_dto.event import Event as EventMLDto
from app.core.dtos.ml_dto.event import (
    EventAttendanceActionLog as EventAttendanceActionLogMLDto,
)
from app.core.dtos.ml_dto.event import Recurrence as RecurrenceMLDto
from app.core.dtos.ml_dto.event import RecurrenceRule as RecurrenceRuleMLDto
from app.core.dtos.ml_dto.forecast import (
    ForecastAttendanceTimeRequest,
)
from app.core.error.error_code import ErrorCode
from app.core.features.event import (
    AttendanceAction,
    AttendanceState,
    Event,
    Recurrence,
    RecurrenceRule,
    Weekday,
)
from app.core.infrastructure.db.transaction import rollbackable
from app.core.infrastructure.sqlalchemy.repositories.account import (
    UserAccountRepository,
)
from app.core.infrastructure.sqlalchemy.repositories.event import (
    EventAttendanceActionLogRepository,
    EventAttendanceForecastRepository,
    EventAttendanceRepository,
    EventRepository,
    RecurrenceRepository,
    RecurrenceRuleRepository,
)
from app.core.utils.datetime import validate_date
from app.core.utils.rfc5545 import parse_recurrence, serialize_recurrence
from app.core.utils.uuid import UUID, generate_uuid, str_to_uuid, uuid_to_str


def listify_byday(
    byday: list[tuple[int, Weekday]] | None,
) -> list[list[int | Weekday]] | None:
    return [list(i) for i in byday] if byday is not None else None


def parse_byday(
    byday: list[list[int | Weekday]] | None,
) -> list[tuple[int, Weekday]] | None:
    return [(int(i[0]), Weekday(str(i[1]))) for i in byday] if byday is not None else None


def stringify_dates(dates: list[date]) -> list[str]:
    return [d.isoformat() for d in dates]


def parse_dates(dates: list[str]) -> list[date]:
    return [date.fromisoformat(d) for d in dates]


def serialize_events(events: set[EventEntity]) -> list[EventWithIdDto]:
    event_dto_list = []
    for event in events:
        recurrence: Recurrence | None = None
        if event.recurrence is not None:
            recurrence = Recurrence(
                rrule=RecurrenceRule(
                    freq=event.recurrence.rrule.freq,
                    until=event.recurrence.rrule.until,
                    count=event.recurrence.rrule.count,
                    interval=event.recurrence.rrule.interval,
                    bysecond=event.recurrence.rrule.bysecond,
                    byminute=event.recurrence.rrule.byminute,
                    byhour=event.recurrence.rrule.byhour,
                    byday=parse_byday(event.recurrence.rrule.byday),
                    bymonthday=event.recurrence.rrule.bymonthday,
                    byyearday=event.recurrence.rrule.byyearday,
                    byweekno=event.recurrence.rrule.byweekno,
                    bymonth=event.recurrence.rrule.bymonth,
                    bysetpos=event.recurrence.rrule.bysetpos,
                    wkst=event.recurrence.rrule.wkst,
                ),
                rdate=(parse_dates(event.recurrence.rdate) if event.is_all_day else []),
                exdate=(parse_dates(event.recurrence.exdate) if event.is_all_day else []),
            )
        event_dto_list.append(
            EventWithIdDto(
                id=uuid_to_str(event.id),
                summary=event.summary,
                location=event.location,
                start=event.start,
                end=event.end,
                is_all_day=event.is_all_day,
                recurrence_list=serialize_recurrence(recurrence, event.is_all_day),
                timezone=event.timezone,
            )
        )
    return event_dto_list


class EventUsecase(IUsecase):
    @rollbackable
    async def create_event_async(
        self,
        host_id: UUID,
        event_dto: EventDto,
    ) -> CreateEventResponse:
        user_account_repository = UserAccountRepository(self.uow)
        recurrence_rule_repository = RecurrenceRuleRepository(self.uow)
        recurrence_repository = RecurrenceRepository(self.uow)
        event_repository = EventRepository(self.uow)

        assert event_dto.start.tzname() == "UTC"
        assert event_dto.end.tzname() == "UTC"
        validate_date(
            is_all_day=event_dto.is_all_day,
            date_value=event_dto.start,
            timezone=event_dto.timezone,
        )
        validate_date(
            is_all_day=event_dto.is_all_day,
            date_value=event_dto.end,
            timezone=event_dto.timezone,
        )

        recurrence = parse_recurrence(event_dto.recurrence_list, event_dto.is_all_day)
        event = Event(
            summary=event_dto.summary,
            location=event_dto.location,
            start=event_dto.start,
            end=event_dto.end,
            timezone=event_dto.timezone,
            recurrence=recurrence,
            is_all_day=event_dto.is_all_day,
        )

        host = await user_account_repository.read_by_id_or_none_async(host_id)
        if host is None:
            return CreateEventResponse(error_codes=[ErrorCode.ACCOUNT_NOT_FOUND])

        user_id = host.user_id

        recurrence_id: UUID | None
        if event.recurrence is None:
            recurrence_id = None
        else:
            recurrence_rule = await recurrence_rule_repository.create_recurrence_rule_async(
                entity_id=generate_uuid(),
                user_id=user_id,
                freq=event.recurrence.rrule.freq,
                until=event.recurrence.rrule.until,
                count=event.recurrence.rrule.count,
                interval=event.recurrence.rrule.interval,
                bysecond=event.recurrence.rrule.bysecond,
                byminute=event.recurrence.rrule.byminute,
                byhour=event.recurrence.rrule.byhour,
                byday=listify_byday(event.recurrence.rrule.byday),
                bymonthday=event.recurrence.rrule.bymonthday,
                byyearday=event.recurrence.rrule.byyearday,
                byweekno=event.recurrence.rrule.byweekno,
                bymonth=event.recurrence.rrule.bymonth,
                bysetpos=event.recurrence.rrule.bysetpos,
                wkst=event.recurrence.rrule.wkst,
            )
            if recurrence_rule is None:
                raise ValueError("Failed to create recurrence rule")

            recurrence_entity = await recurrence_repository.create_recurrence_async(
                entity_id=generate_uuid(),
                user_id=user_id,
                rrule_id=recurrence_rule.id,
                rrule=recurrence_rule,
                rdate=stringify_dates(event.recurrence.rdate),
                exdate=stringify_dates(event.recurrence.exdate),
            )
            if recurrence_entity is None:
                raise ValueError("Failed to create recurrence")

            recurrence_id = recurrence_entity.id

        event_entity = await event_repository.create_event_async(
            entity_id=generate_uuid(),
            user_id=user_id,
            summary=event.summary,
            location=event.location,
            start=event.start,
            end=event.end,
            is_all_day=event.is_all_day,
            recurrence_id=recurrence_id,
            timezone=event.timezone,
        )
        if event_entity is None:
            raise ValueError("Failed to create event")

        return CreateEventResponse(error_codes=[])

    @rollbackable
    async def update_event_async(
        self,
        host_id: UUID,
        event_id_str: str,
        event_dto: EventDto,
    ) -> UpdateEventResponse:
        user_account_repository = UserAccountRepository(self.uow)
        recurrence_rule_repository = RecurrenceRuleRepository(self.uow)
        recurrence_repository = RecurrenceRepository(self.uow)
        event_repository = EventRepository(self.uow)

        assert event_dto.start.tzname() == "UTC"
        assert event_dto.end.tzname() == "UTC"
        validate_date(
            is_all_day=event_dto.is_all_day,
            date_value=event_dto.start,
            timezone=event_dto.timezone,
        )
        validate_date(
            is_all_day=event_dto.is_all_day,
            date_value=event_dto.end,
            timezone=event_dto.timezone,
        )

        event_id = str_to_uuid(event_id_str)

        host = await user_account_repository.read_by_id_or_none_async(host_id)
        if host is None:
            return UpdateEventResponse(error_codes=[ErrorCode.ACCOUNT_NOT_FOUND])

        user_id = host.user_id

        existing_event = await event_repository.read_with_recurrence_by_id_or_none_async(event_id)
        if existing_event is None:
            return UpdateEventResponse(error_codes=[ErrorCode.EVENT_NOT_FOUND])
        if existing_event.user_id != user_id:
            return UpdateEventResponse(error_codes=[ErrorCode.EVENT_ACCESS_DENIED])

        recurrence = parse_recurrence(event_dto.recurrence_list, event_dto.is_all_day)

        recurrence_id: UUID | None = None
        if recurrence is not None:
            if existing_event.recurrence_id is not None:
                existing_recurrence = existing_event.recurrence
                if existing_recurrence is not None:
                    await recurrence_rule_repository.update_recurrence_rule_async(
                        entity_id=existing_recurrence.rrule_id,
                        freq=recurrence.rrule.freq,
                        until=recurrence.rrule.until,
                        count=recurrence.rrule.count,
                        interval=recurrence.rrule.interval,
                        bysecond=recurrence.rrule.bysecond,
                        byminute=recurrence.rrule.byminute,
                        byhour=recurrence.rrule.byhour,
                        byday=listify_byday(recurrence.rrule.byday),
                        bymonthday=recurrence.rrule.bymonthday,
                        byyearday=recurrence.rrule.byyearday,
                        byweekno=recurrence.rrule.byweekno,
                        bymonth=recurrence.rrule.bymonth,
                        bysetpos=recurrence.rrule.bysetpos,
                        wkst=recurrence.rrule.wkst,
                    )
                    await recurrence_repository.update_recurrence_async(
                        entity_id=existing_event.recurrence_id,
                        rdate=stringify_dates(recurrence.rdate),
                        exdate=stringify_dates(recurrence.exdate),
                    )
                    recurrence_id = existing_event.recurrence_id
                else:
                    raise ValueError("Although recurrence_id is not None, recurrence is None")
            else:
                recurrence_rule = await recurrence_rule_repository.create_recurrence_rule_async(
                    entity_id=generate_uuid(),
                    user_id=user_id,
                    freq=recurrence.rrule.freq,
                    until=recurrence.rrule.until,
                    count=recurrence.rrule.count,
                    interval=recurrence.rrule.interval,
                    bysecond=recurrence.rrule.bysecond,
                    byminute=recurrence.rrule.byminute,
                    byhour=recurrence.rrule.byhour,
                    byday=listify_byday(recurrence.rrule.byday),
                    bymonthday=recurrence.rrule.bymonthday,
                    byyearday=recurrence.rrule.byyearday,
                    byweekno=recurrence.rrule.byweekno,
                    bymonth=recurrence.rrule.bymonth,
                    bysetpos=recurrence.rrule.bysetpos,
                    wkst=recurrence.rrule.wkst,
                )
                if recurrence_rule is None:
                    raise ValueError("Failed to create recurrence rule")

                recurrence_entity = await recurrence_repository.create_recurrence_async(
                    entity_id=generate_uuid(),
                    user_id=user_id,
                    rrule_id=recurrence_rule.id,
                    rrule=recurrence_rule,
                    rdate=stringify_dates(recurrence.rdate),
                    exdate=stringify_dates(recurrence.exdate),
                )
                if recurrence_entity is None:
                    raise ValueError("Failed to create recurrence")

                recurrence_id = recurrence_entity.id

        await event_repository.update_event_async(
            entity_id=event_id,
            summary=event_dto.summary,
            location=event_dto.location,
            start=event_dto.start,
            end=event_dto.end,
            is_all_day=event_dto.is_all_day,
            recurrence_id=recurrence_id,
            timezone=event_dto.timezone,
        )

        return UpdateEventResponse(error_codes=[])

    @rollbackable
    async def attend_event_async(
        self,
        guest_id: UUID,
        event_id_str: str,
        start: datetime,
        action: AttendanceAction,
    ) -> AttendEventResponse:
        user_account_repository = UserAccountRepository(self.uow)
        event_repository = EventRepository(self.uow)
        event_attendance_repository = EventAttendanceRepository(self.uow)
        event_attendance_action_log_repository = EventAttendanceActionLogRepository(self.uow)

        event_id = str_to_uuid(event_id_str)

        guest = await user_account_repository.read_by_id_or_none_async(guest_id)
        if guest is None:
            return AttendEventResponse(error_codes=[ErrorCode.ACCOUNT_NOT_FOUND])

        user_id = guest.user_id

        event = await event_repository.read_by_id_or_none_async(event_id)
        if event is None:
            return AttendEventResponse(error_codes=[ErrorCode.EVENT_NOT_FOUND])

        if action == AttendanceAction.ATTEND:
            if not event.is_attendable(start, datetime.now(ZoneInfo("UTC"))):
                return AttendEventResponse(
                    error_codes=[ErrorCode.EVENT_NOT_ATTENDABLE],
                )

            await event_attendance_repository.create_or_update_event_attendance_async(
                entity_id=generate_uuid(),
                user_id=user_id,
                event_id=event.id,
                start=start,
                state=AttendanceState.PRESENT,
            )
        elif action == AttendanceAction.LEAVE:
            if not event.is_leaveable(start, datetime.now(ZoneInfo("UTC"))):
                return AttendEventResponse(error_codes=[ErrorCode.EVENT_NOT_LEAVEABLE])

            await event_attendance_repository.create_or_update_event_attendance_async(
                entity_id=generate_uuid(),
                user_id=user_id,
                event_id=event.id,
                start=start,
                state=AttendanceState.EXCUSED_ABSENCE,
            )

        await event_attendance_action_log_repository.create_event_attendance_action_log_async(
            entity_id=generate_uuid(),
            user_id=user_id,
            event_id=event.id,
            start=start,
            action=action,
            acted_at=datetime.now(ZoneInfo("UTC")),
        )

        return AttendEventResponse(error_codes=[])

    @rollbackable
    async def update_attendances_async(
        self,
        guest_id: UUID,
        event_id_str: str,
        start: datetime,
        attendances: list[AttendanceDto],
    ) -> UpdateAttendancesResponse:
        user_account_repository = UserAccountRepository(self.uow)
        event_repository = EventRepository(self.uow)
        event_attendance_repository = EventAttendanceRepository(self.uow)
        event_attendance_action_log_repository = EventAttendanceActionLogRepository(self.uow)

        event_id = str_to_uuid(event_id_str)

        guest = await user_account_repository.read_by_id_or_none_async(guest_id)
        if guest is None:
            return UpdateAttendancesResponse(error_codes=[ErrorCode.ACCOUNT_NOT_FOUND])

        user_id = guest.user_id

        event = await event_repository.read_by_id_or_none_async(event_id)
        if event is None:
            return UpdateAttendancesResponse(error_codes=[ErrorCode.EVENT_NOT_FOUND])

        await event_attendance_action_log_repository.delete_by_user_id_and_event_id_and_start_async(
            user_id=user_id, event_id=event.id, start=start
        )

        event_attendance_action_logs = {
            EventAttendanceActionLogEntity(
                entity_id=generate_uuid(),
                user_id=user_id,
                event_id=event.id,
                start=start,
                action=AttendanceAction(attendance.action),
                acted_at=attendance.acted_at,
            )
            for attendance in attendances
        }
        await event_attendance_action_log_repository.bulk_create_event_attendance_action_logs_async(
            event_attendance_action_logs
        )

        latest_log = max(event_attendance_action_logs, key=lambda log: log.acted_at)
        if latest_log.action == AttendanceAction.ATTEND:
            await event_attendance_repository.create_or_update_event_attendance_async(
                entity_id=generate_uuid(),
                user_id=user_id,
                event_id=event.id,
                start=start,
                state=AttendanceState.PRESENT,
            )
        elif latest_log.action == AttendanceAction.LEAVE:
            await event_attendance_repository.create_or_update_event_attendance_async(
                entity_id=generate_uuid(),
                user_id=user_id,
                event_id=event.id,
                start=start,
                state=AttendanceState.EXCUSED_ABSENCE,
            )

        return UpdateAttendancesResponse(error_codes=[])

    @rollbackable
    async def get_attendance_history_async(
        self, guest_id: UUID, event_id_str: str, start: datetime
    ) -> GetAttendanceHistoryResponse:
        user_account_repository = UserAccountRepository(self.uow)
        event_repository = EventRepository(self.uow)
        event_attendance_action_log_repository = EventAttendanceActionLogRepository(self.uow)

        event_id = str_to_uuid(event_id_str)

        guest = await user_account_repository.read_by_id_or_none_async(guest_id)
        if guest is None:
            return GetAttendanceHistoryResponse(
                attendances_with_username=AttendancesWithUsernameDto(username="", attendances=[]),
                error_codes=[ErrorCode.ACCOUNT_NOT_FOUND],
            )

        user_id = guest.user_id

        event = await event_repository.read_by_id_or_none_async(event_id)
        if event is None:
            return GetAttendanceHistoryResponse(
                attendances_with_username=AttendancesWithUsernameDto(username="", attendances=[]),
                error_codes=[ErrorCode.EVENT_NOT_FOUND],
            )

        logs = await event_attendance_action_log_repository.read_by_user_id_and_event_id_and_start_async(
            user_id=user_id, event_id=event_id, start=start
        )

        attendances = [AttendanceDto(action=log.action, acted_at=log.acted_at) for log in logs]

        return GetAttendanceHistoryResponse(
            attendances_with_username=AttendancesWithUsernameDto(username=guest.username, attendances=attendances),
            error_codes=[],
        )

    @rollbackable
    async def get_my_events_async(self, account_id: UUID) -> GetMyEventsResponse:
        user_account_repository = UserAccountRepository(self.uow)
        event_repository = EventRepository(self.uow)

        user_account = await user_account_repository.read_by_id_or_none_async(account_id)
        if user_account is None:
            return GetMyEventsResponse(
                events=[],
                error_codes=[ErrorCode.ACCOUNT_NOT_FOUND],
            )

        user_id = user_account.user_id

        events = await event_repository.read_with_recurrence_by_user_ids_async({user_id})

        return GetMyEventsResponse(events=serialize_events(events), error_codes=[])

    @rollbackable
    async def get_following_events_async(self, follower_id: UUID) -> GetFollowingEventsResponse:
        user_account_repository = UserAccountRepository(self.uow)
        event_repository = EventRepository(self.uow)

        follower = await user_account_repository.read_with_followees_by_id_or_none_async(follower_id)
        if follower is None:
            return GetFollowingEventsResponse(
                events=[],
                error_codes=[ErrorCode.ACCOUNT_NOT_FOUND],
            )

        user_ids = {followee.user_id for followee in follower.followees} | {follower.user_id}

        events = await event_repository.read_with_recurrence_by_user_ids_async(user_ids)

        return GetFollowingEventsResponse(
            events=serialize_events(events),
            error_codes=[],
        )

    @rollbackable
    async def get_guest_attendance_status_async(
        self, guest_id: UUID, event_id_str: str, start: datetime
    ) -> GetGuestAttendanceStatusResponse:
        user_account_repository = UserAccountRepository(self.uow)
        event_repository = EventRepository(self.uow)
        event_attendance_action_log_repository = EventAttendanceActionLogRepository(self.uow)

        event_id = str_to_uuid(event_id_str)

        guest = await user_account_repository.read_by_id_or_none_async(guest_id)
        if guest is None:
            return GetGuestAttendanceStatusResponse(
                attend=False,
                error_codes=[ErrorCode.ACCOUNT_NOT_FOUND],
            )

        user_id = guest.user_id

        event = await event_repository.read_by_id_or_none_async(event_id)
        if event is None:
            return GetGuestAttendanceStatusResponse(
                attend=False,
                error_codes=[ErrorCode.EVENT_NOT_FOUND],
            )

        event_attendance_action_log = (
            await event_attendance_action_log_repository.read_latest_by_user_id_and_event_id_and_start_or_none_async(
                user_id=user_id, event_id=event_id, start=start
            )
        )
        if event_attendance_action_log is None:
            return GetGuestAttendanceStatusResponse(attend=False, error_codes=[])

        return GetGuestAttendanceStatusResponse(
            attend=event_attendance_action_log.action == AttendanceAction.ATTEND,
            error_codes=[],
        )

    @rollbackable
    async def forecast_attendance_time_async(
        self,
    ) -> ForecastAttendanceTimeResponse:
        event_attendance_action_log_repository = EventAttendanceActionLogRepository(self.uow)
        event_repository = EventRepository(self.uow)
        user_account_repository = UserAccountRepository(self.uow)
        event_attendance_forecast_repository = EventAttendanceForecastRepository(self.uow)

        earliest_attend_data = await event_attendance_action_log_repository.read_all_earliest_attend_async()
        latest_leave_data = await event_attendance_action_log_repository.read_all_latest_leave_async()
        event_data = await event_repository.read_all_with_recurrence_async(where=[])
        user_data = await user_account_repository.read_all_async(where=[])

        try:
            earliest_attend_dtos = [
                EventAttendanceActionLogMLDto(
                    id=uuid_to_str(log.id),
                    user_id=log.user_id,
                    event_id=uuid_to_str(log.event_id),
                    start=log.start,
                    action=log.action,
                    acted_at=log.acted_at,
                )
                for log in earliest_attend_data
            ]
            latest_leave_dtos = [
                EventAttendanceActionLogMLDto(
                    id=uuid_to_str(log.id),
                    user_id=log.user_id,
                    event_id=uuid_to_str(log.event_id),
                    start=log.start,
                    action=log.action,
                    acted_at=log.acted_at,
                )
                for log in latest_leave_data
            ]
            event_dtos = [
                EventMLDto(
                    id=uuid_to_str(event.id),
                    user_id=event.user_id,
                    start=event.start,
                    end=event.end,
                    timezone=event.timezone,
                    recurrence=RecurrenceMLDto(
                        id=uuid_to_str(event.recurrence.id),
                        rrule=RecurrenceRuleMLDto(
                            id=uuid_to_str(event.recurrence.rrule.id),
                            freq=event.recurrence.rrule.freq,
                        ),
                    )
                    if event.recurrence
                    else None,
                )
                for event in event_data
            ]
            user_dtos = [
                UserAccountMLDto(
                    id=uuid_to_str(user.id),
                    user_id=user.user_id,
                    birth_date=user.birth_date,
                    gender=user.gender,
                )
                for user in user_data
            ]
            request = ForecastAttendanceTimeRequest(
                earliest_attend_data=earliest_attend_dtos,
                latest_leave_data=latest_leave_dtos,
                event_data=event_dtos,
                user_data=user_dtos,
            )
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{ML_SERVER_URL}/forecast/attendance",
                    json=request.model_dump(),
                    timeout=600,  # Set reasonable timeout
                )
                response.raise_for_status()  # Raise exception for 4xx/5xx status codes
                forecast_result = ForecastAttendanceTimeResponse.model_validate(response.json())
        except (httpx.TimeoutException, httpx.NetworkError):
            # Handle network timeouts and connection errors
            return ForecastAttendanceTimeResponse(
                attendance_time_forecasts={},
                error_codes=[ErrorCode.ML_SERVER_TIMEOUT],
            )
        except httpx.HTTPStatusError:
            # Handle HTTP errors (4xx, 5xx responses)
            return ForecastAttendanceTimeResponse(
                attendance_time_forecasts={},
                error_codes=[ErrorCode.ML_SERVER_ERROR],
            )
        except ValueError:
            # Handle validation errors from model_validate
            return ForecastAttendanceTimeResponse(
                attendance_time_forecasts={},
                error_codes=[ErrorCode.ML_SERVER_ERROR],
            )

        forecasts = {
            EventAttendanceForecastEntity(
                entity_id=generate_uuid(),
                user_id=user_id,
                event_id=str_to_uuid(event_id),
                start=forecast.start,
                forecasted_attended_at=forecast.attended_at,
                forecasted_duration=forecast.duration,
            )
            for user_id, events in forecast_result.attendance_time_forecasts.items()
            for event_id, forecasts in events.items()
            for forecast in forecasts
        }
        await event_attendance_forecast_repository.bulk_delete_insert_event_attendance_forecasts_async(forecasts)

        return forecast_result

    @rollbackable
    async def get_attendance_time_forecasts_async(self, account_id: UUID) -> GetAttendanceTimeForecastsResponse:
        user_account_repository = UserAccountRepository(self.uow)
        event_repository = EventRepository(self.uow)
        event_attendance_forecast_repository = EventAttendanceForecastRepository(self.uow)

        user_account = await user_account_repository.read_with_followees_by_id_or_none_async(account_id)
        if user_account is None:
            return GetAttendanceTimeForecastsResponse(
                attendance_time_forecasts_with_username={},
                error_codes=[ErrorCode.ACCOUNT_NOT_FOUND],
            )

        user_ids = {followee.user_id for followee in user_account.followees} | {user_account.user_id}
        events = await event_repository.read_with_recurrence_by_user_ids_async(user_ids)
        forecasts = await event_attendance_forecast_repository.read_all_by_event_ids_async(
            {event.id for event in events}
        )

        attendance_time_forecasts: defaultdict[str, defaultdict[int, list[AttendanceTimeForecastDto]]] = defaultdict(
            lambda: defaultdict(list)
        )
        for forecast in forecasts:
            attendance_time_forecasts[uuid_to_str(forecast.event_id)][forecast.user_id].append(
                AttendanceTimeForecastDto(
                    start=forecast.start,
                    attended_at=forecast.forecasted_attended_at,
                    duration=forecast.forecasted_duration,
                )
            )

        username_dict = {
            ua.user_id: ua.username
            for ua in await user_account_repository.read_all_async(
                where=[],
            )  # TODO: read_all_async for user_account table is probably bad
        }
        attendance_time_forecasts_with_username = {
            event_id: {
                user_id: AttendanceTimeForecastsWithUsernameDto(
                    username=username_dict[user_id],
                    attendance_time_forecasts=forecasts,
                )
                for user_id, forecasts in user_forecasts.items()
            }
            for event_id, user_forecasts in attendance_time_forecasts.items()
        }

        return GetAttendanceTimeForecastsResponse(
            attendance_time_forecasts_with_username=attendance_time_forecasts_with_username,
            error_codes=[],
        )
