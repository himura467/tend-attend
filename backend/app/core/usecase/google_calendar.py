from datetime import datetime
from zoneinfo import ZoneInfo

from app.core.constants.secrets import GOOGLE_TOKENS_ENCRYPTION_KEY
from app.core.cryptography.google_tokens import GoogleTokenCryptography
from app.core.domain.entities.google_calendar import (
    GoogleCalendarIntegration as GoogleCalendarIntegrationEntity,
)
from app.core.domain.usecase.base import IUsecase
from app.core.dtos.google_calendar import (
    DisconnectGoogleCalendarResponse,
    FolloweeCalendarInfo,
    GetFolloweeCalendarsResponse,
    GetGoogleCalendarAuthUrlResponse,
    GetGoogleCalendarStatusResponse,
    HandleGoogleCalendarOAuthCallbackResponse,
    SyncGoogleCalendarResponse,
)
from app.core.error.error_code import ErrorCode
from app.core.features.event import Recurrence, RecurrenceRule, Weekday
from app.core.features.google_calendar import GoogleCalendarSyncStatus
from app.core.infrastructure.db.transaction import rollbackable
from app.core.infrastructure.google.calendar_service import GoogleCalendarService
from app.core.infrastructure.google.oauth_flow import GoogleOAuthFlow
from app.core.infrastructure.sqlalchemy.repositories.account import (
    UserAccountRepository,
)
from app.core.infrastructure.sqlalchemy.repositories.event import EventRepository
from app.core.infrastructure.sqlalchemy.repositories.google_calendar import (
    GoogleCalendarIntegrationRepository,
)
from app.core.utils.icalendar import serialize_recurrence
from app.core.utils.uuid import UUID, generate_uuid, uuid_to_str


class GoogleCalendarUsecase(IUsecase):
    assert GOOGLE_TOKENS_ENCRYPTION_KEY is not None

    _token_crypto = GoogleTokenCryptography(encryption_key=GOOGLE_TOKENS_ENCRYPTION_KEY)
    _oauth_flow = GoogleOAuthFlow()
    _calendar_service = GoogleCalendarService(token_crypto=_token_crypto)

    @rollbackable
    async def get_authorization_url(
        self, account_id: UUID, state: str | None = None
    ) -> GetGoogleCalendarAuthUrlResponse:
        """Get Google OAuth authorization URL."""
        user_account_repository = UserAccountRepository(self.uow)

        # Verify account exists
        user_account = await user_account_repository.read_by_id_or_none_async(account_id)
        if not user_account:
            return GetGoogleCalendarAuthUrlResponse(
                error_codes=[ErrorCode.ACCOUNT_NOT_FOUND],
                authorization_url="",
            )

        auth_url = self._oauth_flow.get_authorization_url(state=state)
        return GetGoogleCalendarAuthUrlResponse(error_codes=[], authorization_url=auth_url)

    @rollbackable
    async def handle_oauth_callback_async(
        self, account_id: UUID, auth_code: str
    ) -> HandleGoogleCalendarOAuthCallbackResponse:
        """Handle Google OAuth callback and create calendar integration."""
        user_account_repository = UserAccountRepository(self.uow)
        google_calendar_repository = GoogleCalendarIntegrationRepository(self.uow)

        # Get user_id from account_id
        user_account = await user_account_repository.read_by_id_or_none_async(account_id)
        if not user_account:
            return HandleGoogleCalendarOAuthCallbackResponse(
                error_codes=[ErrorCode.ACCOUNT_NOT_FOUND],
                integration_id=None,
                calendar_url=None,
            )

        user_id = user_account.user_id

        # Exchange authorization code for tokens
        oauth_tokens = await self._oauth_flow.exchange_code_for_tokens(auth_code)

        # Encrypt tokens for storage
        encrypted_access_token = self._token_crypto.encrypt_token(oauth_tokens.access_token)
        encrypted_refresh_token = self._token_crypto.encrypt_token(oauth_tokens.refresh_token)

        # Create calendar in Google
        calendar_info = await self._calendar_service.create_calendar(
            encrypted_access_token=encrypted_access_token,
            encrypted_refresh_token=encrypted_refresh_token,
            summary="Tend Attend Events",
        )

        # Get public calendar URL
        calendar_url = await self._calendar_service.get_calendar_public_url(calendar_info.id)

        # Check if integration already exists
        existing_integration = await google_calendar_repository.read_by_user_id_or_none_async(user_id)

        if existing_integration:
            # Update existing integration with new tokens
            # First update tokens
            await google_calendar_repository.update_tokens_async(
                integration_id=existing_integration.id,
                encrypted_access_token=encrypted_access_token,
                encrypted_refresh_token=encrypted_refresh_token,
                token_expires_at=oauth_tokens.expires_at,
            )
            # Then update calendar info and status
            updated_integration = await google_calendar_repository.update_sync_status_async(
                integration_id=existing_integration.id,
                sync_status=GoogleCalendarSyncStatus.CONNECTED,
                last_sync_at=None,
                last_error=None,
            )
            if not updated_integration:
                raise Exception("Failed to update existing Google Calendar integration")
            integration_id = uuid_to_str(updated_integration.id)
        else:
            # Create new integration
            new_integration = GoogleCalendarIntegrationEntity(
                entity_id=generate_uuid(),
                user_id=user_id,
                google_user_id=oauth_tokens.user_id,
                google_email=oauth_tokens.email,
                encrypted_access_token=encrypted_access_token,
                encrypted_refresh_token=encrypted_refresh_token,
                token_expires_at=oauth_tokens.expires_at,
                calendar_id=calendar_info.id,
                calendar_url=calendar_url,
                sync_status=GoogleCalendarSyncStatus.CONNECTED,
                last_sync_at=None,
                last_error=None,
            )
            created_integration = await google_calendar_repository.create_async(new_integration)
            if not created_integration:
                raise Exception("Failed to create new Google Calendar integration")
            integration_id = uuid_to_str(created_integration.id)

        return HandleGoogleCalendarOAuthCallbackResponse(
            error_codes=[],
            integration_id=integration_id,
            calendar_url=calendar_url,
        )

    @rollbackable
    async def get_integration_status_async(self, account_id: UUID) -> GetGoogleCalendarStatusResponse:
        """Get current Google Calendar integration status for user."""
        user_account_repository = UserAccountRepository(self.uow)
        google_calendar_repository = GoogleCalendarIntegrationRepository(self.uow)

        # Get user_id from account_id
        user_account = await user_account_repository.read_by_id_or_none_async(account_id)
        if not user_account:
            return GetGoogleCalendarStatusResponse(
                error_codes=[ErrorCode.ACCOUNT_NOT_FOUND],
                integration_id=None,
                google_email=None,
                calendar_url=None,
                sync_status=GoogleCalendarSyncStatus.ERROR,
                last_sync_at=None,
                last_error=None,
            )

        user_id = user_account.user_id
        integration = await google_calendar_repository.read_by_user_id_or_none_async(user_id)

        if not integration:
            return GetGoogleCalendarStatusResponse(
                error_codes=[],
                integration_id=None,
                google_email=None,
                calendar_url=None,
                sync_status=GoogleCalendarSyncStatus.DISCONNECTED,
                last_sync_at=None,
                last_error=None,
            )

        # Get calendar URL if integration exists
        calendar_url = None
        if integration.calendar_id:
            calendar_url = await self._calendar_service.get_calendar_public_url(integration.calendar_id)

        return GetGoogleCalendarStatusResponse(
            error_codes=[],
            integration_id=uuid_to_str(integration.id),
            google_email=integration.google_email,
            calendar_url=calendar_url,
            sync_status=integration.sync_status,
            last_sync_at=integration.last_sync_at,
            last_error=integration.last_error,
        )

    @rollbackable
    async def disconnect_integration_async(self, account_id: UUID) -> DisconnectGoogleCalendarResponse:
        """Disconnect Google Calendar integration for user."""
        user_account_repository = UserAccountRepository(self.uow)
        google_calendar_repository = GoogleCalendarIntegrationRepository(self.uow)

        # Get user_id from account_id
        user_account = await user_account_repository.read_by_id_or_none_async(account_id)
        if not user_account:
            return DisconnectGoogleCalendarResponse(
                error_codes=[ErrorCode.ACCOUNT_NOT_FOUND],
            )

        user_id = user_account.user_id
        integration = await google_calendar_repository.read_by_user_id_or_none_async(user_id)

        if not integration:
            return DisconnectGoogleCalendarResponse(
                error_codes=[ErrorCode.GOOGLE_CALENDAR_NOT_CONNECTED],
            )

        # Update status to disconnected
        await google_calendar_repository.update_sync_status_async(
            integration_id=integration.id,
            sync_status=GoogleCalendarSyncStatus.DISCONNECTED,
            last_sync_at=integration.last_sync_at,
            last_error=None,
        )

        return DisconnectGoogleCalendarResponse(error_codes=[])

    @rollbackable
    async def sync_events_async(self, account_id: UUID) -> SyncGoogleCalendarResponse:
        """Sync user events to Google Calendar."""
        user_account_repository = UserAccountRepository(self.uow)
        google_calendar_repository = GoogleCalendarIntegrationRepository(self.uow)
        event_repository = EventRepository(self.uow)

        # Get user_id from account_id
        user_account = await user_account_repository.read_by_id_or_none_async(account_id)
        if not user_account:
            return SyncGoogleCalendarResponse(
                error_codes=[ErrorCode.ACCOUNT_NOT_FOUND],
                sync_status=GoogleCalendarSyncStatus.ERROR,
                events_synced=0,
                last_sync_at=None,
            )

        user_id = user_account.user_id
        integration = await google_calendar_repository.read_by_user_id_or_none_async(user_id)

        if not integration:
            return SyncGoogleCalendarResponse(
                error_codes=[ErrorCode.GOOGLE_CALENDAR_NOT_CONNECTED],
                sync_status=GoogleCalendarSyncStatus.DISCONNECTED,
                events_synced=0,
                last_sync_at=None,
            )

        if integration.sync_status == GoogleCalendarSyncStatus.DISCONNECTED:
            return SyncGoogleCalendarResponse(
                error_codes=[ErrorCode.GOOGLE_CALENDAR_NOT_CONNECTED],
                sync_status=GoogleCalendarSyncStatus.DISCONNECTED,
                events_synced=0,
                last_sync_at=integration.last_sync_at,
            )

        try:
            # Update status to syncing
            await google_calendar_repository.update_sync_status_async(
                integration_id=integration.id,
                sync_status=GoogleCalendarSyncStatus.SYNCING,
                last_sync_at=integration.last_sync_at,
                last_error=None,
            )

            # Fetch all user's events with recurrence information
            events = await event_repository.read_with_recurrence_by_user_ids_async({user_id})

            # Sync each event to Google Calendar
            events_synced = 0
            for event in events:
                try:
                    # Build recurrence list for Google Calendar
                    recurrence_list = None
                    if event.recurrence:
                        recurrence = Recurrence(
                            rrule=RecurrenceRule(
                                freq=event.recurrence.rrule.freq,
                                until=event.recurrence.rrule.until,
                                count=event.recurrence.rrule.count,
                                interval=event.recurrence.rrule.interval,
                                bysecond=event.recurrence.rrule.bysecond,
                                byminute=event.recurrence.rrule.byminute,
                                byhour=event.recurrence.rrule.byhour,
                                byday=event.recurrence.rrule.byday,
                                bymonthday=event.recurrence.rrule.bymonthday,
                                byyearday=event.recurrence.rrule.byyearday,
                                byweekno=event.recurrence.rrule.byweekno,
                                bymonth=event.recurrence.rrule.bymonth,
                                bysetpos=event.recurrence.rrule.bysetpos,
                                wkst=event.recurrence.rrule.wkst or Weekday.MO,
                            ),
                            rdate=event.recurrence.rdate,
                            exdate=event.recurrence.exdate,
                        )
                        recurrence_list = serialize_recurrence(
                            recurrence, event.dtstart, event.is_all_day, event.timezone
                        )

                    # Create event in Google Calendar
                    await self._calendar_service.create_event(
                        encrypted_access_token=integration.encrypted_access_token,
                        encrypted_refresh_token=integration.encrypted_refresh_token,
                        calendar_id=integration.calendar_id,
                        summary=event.summary,
                        start_time=event.dtstart,
                        end_time=event.dtend,
                        description=None,
                        location=event.location,
                        recurrence=recurrence_list,
                    )
                    events_synced += 1
                except Exception:
                    # Continue syncing other events even if one fails
                    pass

            # Update status to connected with sync time
            current_time = datetime.now(ZoneInfo("UTC"))
            await google_calendar_repository.update_sync_status_async(
                integration_id=integration.id,
                sync_status=GoogleCalendarSyncStatus.CONNECTED,
                last_sync_at=current_time,
                last_error=None,
            )

            return SyncGoogleCalendarResponse(
                error_codes=[],
                sync_status=GoogleCalendarSyncStatus.CONNECTED,
                events_synced=events_synced,
                last_sync_at=current_time,
            )
        except Exception as e:
            # Update status to error
            await google_calendar_repository.update_sync_status_async(
                integration_id=integration.id,
                sync_status=GoogleCalendarSyncStatus.ERROR,
                last_sync_at=integration.last_sync_at,
                last_error=str(e),
            )

            return SyncGoogleCalendarResponse(
                error_codes=[ErrorCode.GOOGLE_CALENDAR_SYNC_FAILED],
                sync_status=GoogleCalendarSyncStatus.ERROR,
                events_synced=0,
                last_sync_at=integration.last_sync_at,
            )

    @rollbackable
    async def get_followee_calendars_async(self, account_id: UUID) -> GetFolloweeCalendarsResponse:
        """Get calendar URLs for all followees who have Google Calendar integration."""
        user_account_repository = UserAccountRepository(self.uow)
        google_calendar_repository = GoogleCalendarIntegrationRepository(self.uow)

        # Get user account with followees using account_id directly
        user_account = await user_account_repository.read_with_followees_by_id_or_none_async(account_id)

        if not user_account:
            return GetFolloweeCalendarsResponse(
                error_codes=[ErrorCode.ACCOUNT_NOT_FOUND],
                calendars=[],
            )
        if not user_account.followees:
            return GetFolloweeCalendarsResponse(
                error_codes=[],
                calendars=[],
            )

        calendars = []
        for followee in user_account.followees:
            # Get Google Calendar integration for each followee using their user_id
            integration = await google_calendar_repository.read_by_user_id_or_none_async(followee.user_id)

            if (
                integration
                and integration.sync_status == GoogleCalendarSyncStatus.CONNECTED
                and integration.calendar_id
            ):
                calendar_url = await self._calendar_service.get_calendar_public_url(integration.calendar_id)

                calendars.append(
                    FolloweeCalendarInfo(
                        username=followee.username,
                        nickname=followee.nickname,
                        calendar_url=calendar_url,
                        last_sync_at=integration.last_sync_at,
                    )
                )

        return GetFolloweeCalendarsResponse(
            error_codes=[],
            calendars=calendars,
        )
