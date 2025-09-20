from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio.session import AsyncSession

from app.api.deps import AccessControl
from app.core.dtos.google_calendar import (
    DisconnectGoogleCalendarResponse,
    GetFolloweeCalendarsResponse,
    GetGoogleCalendarAuthUrlResponse,
    GetGoogleCalendarStatusResponse,
    HandleGoogleCalendarOAuthCallbackRequest,
    HandleGoogleCalendarOAuthCallbackResponse,
    SyncGoogleCalendarResponse,
)
from app.core.features.account import Account, Role
from app.core.infrastructure.sqlalchemy.db import get_db_async
from app.core.infrastructure.sqlalchemy.unit_of_work import SqlalchemyUnitOfWork
from app.core.usecase.google_calendar import GoogleCalendarUsecase

router = APIRouter()


@router.get(
    path="/auth/url",
    name="Get Google Calendar Auth URL",
    response_model=GetGoogleCalendarAuthUrlResponse,
)
async def get_google_calendar_auth_url(
    state: str | None = Query(None, description="OAuth state parameter"),
    session: AsyncSession = Depends(get_db_async),
    account: Account = Depends(AccessControl(permit={Role.HOST})),
) -> GetGoogleCalendarAuthUrlResponse:
    """Get Google OAuth authorization URL for calendar integration."""
    uow = SqlalchemyUnitOfWork(session=session)
    usecase = GoogleCalendarUsecase(uow=uow)

    return await usecase.get_authorization_url(account_id=account.account_id, state=state)


@router.post(
    path="/auth/callback",
    name="Handle Google Calendar OAuth Callback",
    response_model=HandleGoogleCalendarOAuthCallbackResponse,
)
async def handle_google_calendar_oauth_callback(
    req: HandleGoogleCalendarOAuthCallbackRequest,
    session: AsyncSession = Depends(get_db_async),
    account: Account = Depends(AccessControl(permit={Role.HOST})),
) -> HandleGoogleCalendarOAuthCallbackResponse:
    """Handle Google OAuth callback and create calendar integration."""
    uow = SqlalchemyUnitOfWork(session=session)
    usecase = GoogleCalendarUsecase(uow=uow)

    return await usecase.handle_oauth_callback_async(
        account_id=account.account_id,
        auth_code=req.auth_code,
    )


@router.get(
    path="/status",
    name="Get Google Calendar Status",
    response_model=GetGoogleCalendarStatusResponse,
)
async def get_google_calendar_status(
    session: AsyncSession = Depends(get_db_async),
    account: Account = Depends(AccessControl(permit={Role.HOST})),
) -> GetGoogleCalendarStatusResponse:
    """Get current Google Calendar integration status for the authenticated user."""
    uow = SqlalchemyUnitOfWork(session=session)
    usecase = GoogleCalendarUsecase(uow=uow)

    return await usecase.get_integration_status_async(account_id=account.account_id)


@router.post(
    path="/disconnect",
    name="Disconnect Google Calendar",
    response_model=DisconnectGoogleCalendarResponse,
)
async def disconnect_google_calendar(
    session: AsyncSession = Depends(get_db_async),
    account: Account = Depends(AccessControl(permit={Role.HOST})),
) -> DisconnectGoogleCalendarResponse:
    """Disconnect Google Calendar integration for the authenticated user."""
    uow = SqlalchemyUnitOfWork(session=session)
    usecase = GoogleCalendarUsecase(uow=uow)

    return await usecase.disconnect_integration_async(account_id=account.account_id)


@router.post(
    path="/sync",
    name="Sync Google Calendar",
    response_model=SyncGoogleCalendarResponse,
)
async def sync_google_calendar(
    session: AsyncSession = Depends(get_db_async),
    account: Account = Depends(AccessControl(permit={Role.HOST})),
) -> SyncGoogleCalendarResponse:
    """Sync user events to Google Calendar."""
    uow = SqlalchemyUnitOfWork(session=session)
    usecase = GoogleCalendarUsecase(uow=uow)

    return await usecase.sync_events_async(account_id=account.account_id)


@router.get(
    path="/followees",
    name="Get Followee Calendars",
    response_model=GetFolloweeCalendarsResponse,
)
async def get_followee_calendars(
    session: AsyncSession = Depends(get_db_async),
    account: Account = Depends(AccessControl(permit={Role.GUEST})),
) -> GetFolloweeCalendarsResponse:
    """Get calendar URLs for all followees who have Google Calendar integration."""
    uow = SqlalchemyUnitOfWork(session=session)
    usecase = GoogleCalendarUsecase(uow=uow)

    return await usecase.get_followee_calendars_async(account_id=account.account_id)
