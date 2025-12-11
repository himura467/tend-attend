from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio.session import AsyncSession

from app.api.deps import AccessControl
from app.core.dtos.event import (
    AttendEventRequest,
    AttendEventResponse,
    CreateEventRequest,
    CreateEventResponse,
    CreateOrUpdateGoalRequest,
    CreateOrUpdateGoalResponse,
    CreateOrUpdateReviewRequest,
    CreateOrUpdateReviewResponse,
    ForecastAttendanceTimeResponse,
    GetAttendanceHistoryResponse,
    GetAttendanceTimeForecastsResponse,
    GetEventGoalsResponse,
    GetEventReviewsResponse,
    GetFollowingEventsResponse,
    GetGuestAttendanceStatusResponse,
    GetGuestGoalResponse,
    GetGuestReviewResponse,
    GetMyEventsResponse,
    UpdateAttendancesRequest,
    UpdateAttendancesResponse,
    UpdateEventRequest,
    UpdateEventResponse,
)
from app.core.features.account import Account, Role
from app.core.infrastructure.sqlalchemy.db import get_db_async
from app.core.infrastructure.sqlalchemy.unit_of_work import SqlalchemyUnitOfWork
from app.core.usecase.event import EventUsecase

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


@router.put(
    path="/{event_id}",
    name="Update Event",
    response_model=UpdateEventResponse,
)
async def update_event(
    event_id: str,
    req: UpdateEventRequest,
    session: AsyncSession = Depends(get_db_async),
    account: Account = Depends(AccessControl(permit={Role.HOST})),
) -> UpdateEventResponse:
    event = req.event

    uow = SqlalchemyUnitOfWork(session=session)
    usecase = EventUsecase(uow=uow)

    return await usecase.update_event_async(
        host_id=account.account_id,
        event_id_str=event_id,
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


@router.post(
    path="/goals/{event_id}/{start}",
    name="Create or Update Goal",
    response_model=CreateOrUpdateGoalResponse,
)
async def create_or_update_goal(
    event_id: str,
    start: datetime,
    req: CreateOrUpdateGoalRequest,
    session: AsyncSession = Depends(get_db_async),
    account: Account = Depends(AccessControl(permit={Role.GUEST})),
) -> CreateOrUpdateGoalResponse:
    goal_text = req.goal_text

    uow = SqlalchemyUnitOfWork(session=session)
    usecase = EventUsecase(uow=uow)

    return await usecase.create_or_update_goal_async(
        guest_id=account.account_id,
        event_id_str=event_id,
        start=start,
        goal_text=goal_text,
    )


@router.get(
    path="/goals/{event_id}/{start}/guests/{guest_id}",
    name="Get Guest Goal",
    response_model=GetGuestGoalResponse,
)
async def get_guest_goal(
    event_id: str,
    start: datetime,
    guest_id: str,
    session: AsyncSession = Depends(get_db_async),
    account: Account = Depends(AccessControl(permit={Role.GUEST})),
) -> GetGuestGoalResponse:
    uow = SqlalchemyUnitOfWork(session=session)
    usecase = EventUsecase(uow=uow)

    return await usecase.get_guest_goal_async(
        requester_id=account.account_id,
        event_id_str=event_id,
        start=start,
        guest_id_str=guest_id,
    )


@router.get(
    path="/goals/{event_id}/{start}",
    name="Get Event Goals",
    response_model=GetEventGoalsResponse,
)
async def get_event_goals(
    event_id: str,
    start: datetime,
    session: AsyncSession = Depends(get_db_async),
    account: Account = Depends(AccessControl(permit={Role.GUEST})),
) -> GetEventGoalsResponse:
    uow = SqlalchemyUnitOfWork(session=session)
    usecase = EventUsecase(uow=uow)

    return await usecase.get_event_goals_async(
        requester_id=account.account_id,
        event_id_str=event_id,
        start=start,
    )


@router.post(
    path="/reviews/{event_id}/{start}",
    name="Create or Update Review",
    response_model=CreateOrUpdateReviewResponse,
)
async def create_or_update_review(
    event_id: str,
    start: datetime,
    req: CreateOrUpdateReviewRequest,
    session: AsyncSession = Depends(get_db_async),
    account: Account = Depends(AccessControl(permit={Role.GUEST})),
) -> CreateOrUpdateReviewResponse:
    review_text = req.review_text

    uow = SqlalchemyUnitOfWork(session=session)
    usecase = EventUsecase(uow=uow)

    return await usecase.create_or_update_review_async(
        guest_id=account.account_id,
        event_id_str=event_id,
        start=start,
        review_text=review_text,
    )


@router.get(
    path="/reviews/{event_id}/{start}/guests/{guest_id}",
    name="Get Guest Review",
    response_model=GetGuestReviewResponse,
)
async def get_guest_review(
    event_id: str,
    start: datetime,
    guest_id: str,
    session: AsyncSession = Depends(get_db_async),
    account: Account = Depends(AccessControl(permit={Role.GUEST})),
) -> GetGuestReviewResponse:
    uow = SqlalchemyUnitOfWork(session=session)
    usecase = EventUsecase(uow=uow)

    return await usecase.get_guest_review_async(
        requester_id=account.account_id,
        event_id_str=event_id,
        start=start,
        guest_id_str=guest_id,
    )


@router.get(
    path="/reviews/{event_id}/{start}",
    name="Get Event Reviews",
    response_model=GetEventReviewsResponse,
)
async def get_event_reviews(
    event_id: str,
    start: datetime,
    session: AsyncSession = Depends(get_db_async),
    account: Account = Depends(AccessControl(permit={Role.GUEST})),
) -> GetEventReviewsResponse:
    uow = SqlalchemyUnitOfWork(session=session)
    usecase = EventUsecase(uow=uow)

    return await usecase.get_event_reviews_async(
        requester_id=account.account_id,
        event_id_str=event_id,
        start=start,
    )
