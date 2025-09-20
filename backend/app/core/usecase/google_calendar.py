from datetime import datetime
from zoneinfo import ZoneInfo

from app.core.constants.secrets import GOOGLE_TOKENS_ENCRYPTION_KEY
from app.core.cryptography.google_tokens import GoogleTokenCryptography
from app.core.domain.entities.google_calendar import (
    GoogleCalendarIntegration as GoogleCalendarIntegrationEntity,
)
from app.core.domain.usecase.base import IUsecase
from app.core.dtos.google_calendar import (
    FolloweeCalendarInfo,
    FolloweeCalendarsResponse,
    GoogleCalendarDisconnectResponse,
    GoogleCalendarOAuthResponse,
    GoogleCalendarStatusResponse,
    GoogleCalendarSyncResponse,
)
from app.core.error.error_code import ErrorCode
from app.core.features.google_calendar import GoogleCalendarSyncStatus
from app.core.infrastructure.db.transaction import rollbackable
from app.core.infrastructure.google.calendar_service import GoogleCalendarService
from app.core.infrastructure.google.oauth_flow import GoogleOAuthFlow
from app.core.infrastructure.sqlalchemy.repositories.account import (
    UserAccountRepository,
)
from app.core.infrastructure.sqlalchemy.repositories.google_calendar import (
    GoogleCalendarIntegrationRepository,
)
from app.core.utils.uuid import generate_uuid, uuid_to_str


class GoogleCalendarUsecase(IUsecase):
    assert GOOGLE_TOKENS_ENCRYPTION_KEY is not None

    _token_crypto = GoogleTokenCryptography(encryption_key=GOOGLE_TOKENS_ENCRYPTION_KEY)
    _oauth_flow = GoogleOAuthFlow()
    _calendar_service = GoogleCalendarService(token_crypto=_token_crypto)

    def get_authorization_url(self, state: str | None = None) -> str:
        """Get Google OAuth authorization URL."""
        return self._oauth_flow.get_authorization_url(state=state)

    async def get_integration_status_async(self, user_id: int) -> GoogleCalendarStatusResponse:
        """Get current Google Calendar integration status for user."""
        google_calendar_repository = GoogleCalendarIntegrationRepository(self.uow)

        integration = await google_calendar_repository.read_by_user_id_or_none_async(user_id)

        if not integration:
            return GoogleCalendarStatusResponse(
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

        return GoogleCalendarStatusResponse(
            error_codes=[],
            integration_id=uuid_to_str(integration.id),
            google_email=integration.google_email,
            calendar_url=calendar_url,
            sync_status=integration.sync_status,
            last_sync_at=integration.last_sync_at,
            last_error=integration.last_error,
        )

    async def get_followee_calendars_async(self, user_id: int) -> FolloweeCalendarsResponse:
        """Get calendar URLs for all followees who have Google Calendar integration."""
        user_account_repository = UserAccountRepository(self.uow)
        google_calendar_repository = GoogleCalendarIntegrationRepository(self.uow)

        try:
            # First find the user by user_id to get their entity_id
            user_account_basic = await user_account_repository.read_by_user_id_or_none_async(user_id)

            if not user_account_basic:
                return FolloweeCalendarsResponse(
                    error_codes=[],
                    calendars=[],
                )

            # Get user account with followees using entity_id
            user_account = await user_account_repository.read_with_followees_by_id_or_none_async(user_account_basic.id)

            if not user_account or not user_account.followees:
                return FolloweeCalendarsResponse(
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

            return FolloweeCalendarsResponse(
                error_codes=[],
                calendars=calendars,
            )

        except Exception:
            return FolloweeCalendarsResponse(
                error_codes=[ErrorCode.FOLLOWEE_CALENDARS_FETCH_FAILED],
                calendars=[],
            )

    @rollbackable
    async def handle_oauth_callback_async(
        self, user_id: int, auth_code: str, state: str | None = None
    ) -> GoogleCalendarOAuthResponse:
        """Handle Google OAuth callback and create calendar integration."""
        google_calendar_repository = GoogleCalendarIntegrationRepository(self.uow)

        try:
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

            return GoogleCalendarOAuthResponse(
                error_codes=[],
                integration_id=integration_id,
                calendar_url=calendar_url,
            )
        except Exception:
            return GoogleCalendarOAuthResponse(
                error_codes=[ErrorCode.GOOGLE_OAUTH_FAILED],
                integration_id=None,
                calendar_url=None,
            )

    @rollbackable
    async def disconnect_integration_async(self, user_id: int) -> GoogleCalendarDisconnectResponse:
        """Disconnect Google Calendar integration for user."""
        google_calendar_repository = GoogleCalendarIntegrationRepository(self.uow)

        integration = await google_calendar_repository.read_by_user_id_or_none_async(user_id)

        if not integration:
            return GoogleCalendarDisconnectResponse(
                error_codes=[ErrorCode.GOOGLE_CALENDAR_NOT_CONNECTED],
            )

        try:
            # Update status to disconnected
            await google_calendar_repository.update_sync_status_async(
                integration_id=integration.id,
                sync_status=GoogleCalendarSyncStatus.DISCONNECTED,
                last_sync_at=integration.last_sync_at,
                last_error=None,
            )

            return GoogleCalendarDisconnectResponse(error_codes=[])
        except Exception:
            return GoogleCalendarDisconnectResponse(
                error_codes=[ErrorCode.GOOGLE_CALENDAR_DISCONNECT_FAILED],
            )

    @rollbackable
    async def sync_events_async(self, user_id: int, force_sync: bool = False) -> GoogleCalendarSyncResponse:
        """Sync user events to Google Calendar."""
        google_calendar_repository = GoogleCalendarIntegrationRepository(self.uow)

        integration = await google_calendar_repository.read_by_user_id_or_none_async(user_id)

        if not integration:
            return GoogleCalendarSyncResponse(
                error_codes=[ErrorCode.GOOGLE_CALENDAR_NOT_CONNECTED],
                sync_status=GoogleCalendarSyncStatus.DISCONNECTED,
                events_synced=0,
                last_sync_at=None,
            )

        if integration.sync_status == GoogleCalendarSyncStatus.DISCONNECTED:
            return GoogleCalendarSyncResponse(
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

            # TODO: Implement actual event synchronization logic
            # This would involve:
            # 1. Fetching user's events from EventRepository
            # 2. Creating/updating events in Google Calendar
            # 3. Handling recurrence rules
            # 4. Managing event deletions
            events_synced = 0  # Placeholder

            # Update status to connected with sync time
            current_time = datetime.now(ZoneInfo("UTC"))
            await google_calendar_repository.update_sync_status_async(
                integration_id=integration.id,
                sync_status=GoogleCalendarSyncStatus.CONNECTED,
                last_sync_at=current_time,
                last_error=None,
            )

            return GoogleCalendarSyncResponse(
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

            return GoogleCalendarSyncResponse(
                error_codes=[ErrorCode.GOOGLE_CALENDAR_SYNC_FAILED],
                sync_status=GoogleCalendarSyncStatus.ERROR,
                events_synced=0,
                last_sync_at=integration.last_sync_at,
            )
