from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio.session import AsyncSession
from app.core.dtos.event import (
    AttendEventRequest,
    AttendEventResponse,
    CreateEventRequest,
    CreateEventResponse,
    ForecastAttendanceTimeResponse,
    GetAttendanceHistoryResponse,
    GetAttendanceTimeForecastsResponse,
    GetFollowingEventsResponse,
    GetGuestAttendanceStatusResponse,
    GetMyEventsResponse,
    UpdateAttendancesRequest,
    UpdateAttendancesResponse,
)
from app.core.features.account import Account, Role
from app.core.infrastructure.sqlalchemy.db import get_db_async
from app.core.infrastructure.sqlalchemy.unit_of_work import SqlalchemyUnitOfWork
from app.core.usecase.event import EventUsecase
from app.api.deps import AccessControl

router = APIRouter()


@router.post(
    path="/create",
    name="Create Event",
    response_model=CreateEventResponse,
)
async def create_event(
    req: CreateEventRequest,
    session: AsyncSession = Depends(get_db_async),
    account: Account = Depends(AccessControl(permit={Role.HOST})),
) -> CreateEventResponse:
    event = req.event

    uow = SqlalchemyUnitOfWork(session=session)
    usecase = EventUsecase(uow=uow)

    return await usecase.create_event_async(
        host_id=account.account_id,
        event_dto=event,
    )


@router.post(
    path="/attend/{event_id}/{start}",
    name="Attend Event",
    response_model=AttendEventResponse,
)
async def attend_event(
    event_id: str,
    start: datetime,
    req: AttendEventRequest,
    session: AsyncSession = Depends(get_db_async),
    account: Account = Depends(AccessControl(permit={Role.GUEST})),
) -> AttendEventResponse:
    action = req.action

    uow = SqlalchemyUnitOfWork(session=session)
    usecase = EventUsecase(uow=uow)

    return await usecase.attend_event_async(
        guest_id=account.account_id,
        event_id_str=event_id,
        start=start,
        action=action,
    )


@router.put(
    path="/attend/{event_id}/{start}",
    name="Update Guest Attendance History",
    response_model=UpdateAttendancesResponse,
)
async def update_attendances(
    event_id: str,
    start: datetime,
    req: UpdateAttendancesRequest,
    session: AsyncSession = Depends(get_db_async),
    account: Account = Depends(AccessControl(permit={Role.GUEST})),
) -> UpdateAttendancesResponse:
    attendances = req.attendances

    uow = SqlalchemyUnitOfWork(session=session)
    usecase = EventUsecase(uow=uow)

    return await usecase.update_attendances_async(
        guest_id=account.account_id,
        event_id_str=event_id,
        start=start,
        attendances=attendances,
    )


@router.get(
    path="/attend/{event_id}/{start}",
    name="Get Guest Attendance History",
    response_model=GetAttendanceHistoryResponse,
)
async def get_attendance_history(
    event_id: str,
    start: datetime,
    session: AsyncSession = Depends(get_db_async),
    account: Account = Depends(AccessControl(permit={Role.GUEST})),
) -> GetAttendanceHistoryResponse:
    uow = SqlalchemyUnitOfWork(session=session)
    usecase = EventUsecase(uow=uow)

    return await usecase.get_attendance_history_async(
        guest_id=account.account_id,
        event_id_str=event_id,
        start=start,
    )


@router.get(
    path="/mine",
    name="Get My Events",
    response_model=GetMyEventsResponse,
)
async def get_my_events(
    session: AsyncSession = Depends(get_db_async),
    account: Account = Depends(AccessControl(permit={Role.HOST})),
) -> GetMyEventsResponse:
    uow = SqlalchemyUnitOfWork(session=session)
    usecase = EventUsecase(uow=uow)

    return await usecase.get_my_events_async(account_id=account.account_id)


@router.get(
    path="/following",
    name="Get Following Events",
    response_model=GetFollowingEventsResponse,
)
async def get_following_events(
    session: AsyncSession = Depends(get_db_async),
    account: Account = Depends(AccessControl(permit={Role.GUEST})),
) -> GetFollowingEventsResponse:
    uow = SqlalchemyUnitOfWork(session=session)
    usecase = EventUsecase(uow=uow)

    return await usecase.get_following_events_async(follower_id=account.account_id)


@router.get(
    path="/attend/status/{event_id}/{start}",
    name="Get Guest Attendance Status",
    response_model=GetGuestAttendanceStatusResponse,
)
async def get_guest_attendance_status(
    event_id: str,
    start: datetime,
    session: AsyncSession = Depends(get_db_async),
    account: Account = Depends(AccessControl(permit={Role.GUEST})),
) -> GetGuestAttendanceStatusResponse:
    uow = SqlalchemyUnitOfWork(session=session)
    usecase = EventUsecase(uow=uow)

    return await usecase.get_guest_attendance_status_async(
        guest_id=account.account_id,
        event_id_str=event_id,
        start=start,
    )


@router.put(
    path="/attend/forecast",
    name="Forecast Attendance Time",
    response_model=ForecastAttendanceTimeResponse,
)
async def forecast_attendance_time(
    session: AsyncSession = Depends(get_db_async),
) -> ForecastAttendanceTimeResponse:
    uow = SqlalchemyUnitOfWork(session=session)
    usecase = EventUsecase(uow=uow)

    return await usecase.forecast_attendance_time_async()


@router.get(
    path="/attend/forecast",
    name="Get Attendance Time Forecasts",
    response_model=GetAttendanceTimeForecastsResponse,
)
async def get_attendance_time_forecasts(
    session: AsyncSession = Depends(get_db_async),
    account: Account = Depends(AccessControl(permit={Role.GUEST})),
) -> GetAttendanceTimeForecastsResponse:
    uow = SqlalchemyUnitOfWork(session=session)
    usecase = EventUsecase(uow=uow)

    return await usecase.get_attendance_time_forecasts_async(
        account_id=account.account_id,
    )
