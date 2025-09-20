from datetime import datetime

from app.core.domain.entities.google_calendar import GoogleCalendarIntegration as GoogleCalendarIntegrationEntity
from app.core.domain.repositories.google_calendar import IGoogleCalendarIntegrationRepository
from app.core.features.google_calendar import GoogleCalendarSyncStatus
from app.core.infrastructure.sqlalchemy.models.shards.google_calendar import GoogleCalendarIntegration
from app.core.infrastructure.sqlalchemy.repositories.base import AbstractRepository
from app.core.utils.uuid import UUID


class GoogleCalendarIntegrationRepository(
    AbstractRepository[GoogleCalendarIntegrationEntity, GoogleCalendarIntegration],
    IGoogleCalendarIntegrationRepository,
):
    @property
    def _model(self) -> type[GoogleCalendarIntegration]:
        return GoogleCalendarIntegration

    async def read_by_user_id_or_none_async(self, user_id: int) -> GoogleCalendarIntegrationEntity | None:
        return await self.read_one_or_none_async([self._model.user_id == user_id])

    async def read_by_google_user_id_or_none_async(self, google_user_id: str) -> GoogleCalendarIntegrationEntity | None:
        return await self.read_one_or_none_async([self._model.google_user_id == google_user_id])

    async def update_tokens_async(
        self,
        integration_id: UUID,
        encrypted_access_token: str,
        encrypted_refresh_token: str,
        token_expires_at: datetime,
    ) -> GoogleCalendarIntegrationEntity | None:
        existing_integration = await self.read_by_id_or_none_async(integration_id)
        if existing_integration is None:
            return None

        updated_integration = GoogleCalendarIntegrationEntity(
            entity_id=integration_id,
            user_id=existing_integration.user_id,
            google_user_id=existing_integration.google_user_id,
            google_email=existing_integration.google_email,
            encrypted_access_token=encrypted_access_token,
            encrypted_refresh_token=encrypted_refresh_token,
            token_expires_at=token_expires_at,
            calendar_id=existing_integration.calendar_id,
            calendar_url=existing_integration.calendar_url,
            sync_status=existing_integration.sync_status,
            last_sync_at=existing_integration.last_sync_at,
            last_error=existing_integration.last_error,
        )
        return await self.update_async(updated_integration)

    async def update_sync_status_async(
        self,
        integration_id: UUID,
        sync_status: GoogleCalendarSyncStatus,
        last_sync_at: datetime | None = None,
        last_error: str | None = None,
    ) -> GoogleCalendarIntegrationEntity | None:
        existing_integration = await self.read_by_id_or_none_async(integration_id)
        if existing_integration is None:
            return None

        updated_integration = GoogleCalendarIntegrationEntity(
            entity_id=integration_id,
            user_id=existing_integration.user_id,
            google_user_id=existing_integration.google_user_id,
            google_email=existing_integration.google_email,
            encrypted_access_token=existing_integration.encrypted_access_token,
            encrypted_refresh_token=existing_integration.encrypted_refresh_token,
            token_expires_at=existing_integration.token_expires_at,
            calendar_id=existing_integration.calendar_id,
            calendar_url=existing_integration.calendar_url,
            sync_status=sync_status,
            last_sync_at=last_sync_at if last_sync_at is not None else existing_integration.last_sync_at,
            last_error=last_error if last_error is not None else existing_integration.last_error,
        )
        return await self.update_async(updated_integration)
