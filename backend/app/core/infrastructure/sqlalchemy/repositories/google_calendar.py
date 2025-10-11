from datetime import datetime

from app.core.domain.entities.google_calendar import GoogleCalendarEventMapping as GoogleCalendarEventMappingEntity
from app.core.domain.entities.google_calendar import GoogleCalendarIntegration as GoogleCalendarIntegrationEntity
from app.core.domain.repositories.google_calendar import IGoogleCalendarIntegrationRepository
from app.core.features.google_calendar import GoogleCalendarSyncStatus
from app.core.infrastructure.sqlalchemy.models.shards.google_calendar import (
    GoogleCalendarEventMapping,
    GoogleCalendarIntegration,
)
from app.core.infrastructure.sqlalchemy.repositories.base import AbstractRepository
from app.core.utils.uuid import UUID, uuid_to_bin


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
        )
        return await self.update_async(updated_integration)

    async def update_sync_status_async(
        self,
        integration_id: UUID,
        sync_status: GoogleCalendarSyncStatus,
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
        )
        return await self.update_async(updated_integration)


class GoogleCalendarEventMappingRepository(
    AbstractRepository[GoogleCalendarEventMappingEntity, GoogleCalendarEventMapping],
):
    @property
    def _model(self) -> type[GoogleCalendarEventMapping]:
        return GoogleCalendarEventMapping

    async def read_by_user_id_and_event_id_or_none_async(
        self, user_id: int, event_id: UUID
    ) -> GoogleCalendarEventMappingEntity | None:
        return await self.read_one_or_none_async(
            [self._model.user_id == user_id, self._model.event_id == uuid_to_bin(event_id)]
        )

    async def create_google_calendar_event_mapping_async(
        self,
        entity_id: UUID,
        user_id: int,
        event_id: UUID,
        google_calendar_id: str,
        google_event_id: str,
        last_synced_at: datetime,
    ) -> GoogleCalendarEventMappingEntity | None:
        mapping = GoogleCalendarEventMappingEntity(
            entity_id=entity_id,
            user_id=user_id,
            event_id=event_id,
            google_calendar_id=google_calendar_id,
            google_event_id=google_event_id,
            last_synced_at=last_synced_at,
        )
        return await self.create_async(mapping)

    async def update_google_calendar_event_mapping_async(
        self,
        entity_id: UUID,
        google_calendar_id: str,
        google_event_id: str,
        last_synced_at: datetime,
    ) -> GoogleCalendarEventMappingEntity | None:
        existing_mapping = await self.read_by_id_or_none_async(entity_id)
        if existing_mapping is None:
            return None

        updated_mapping = GoogleCalendarEventMappingEntity(
            entity_id=entity_id,
            user_id=existing_mapping.user_id,
            event_id=existing_mapping.event_id,
            google_calendar_id=google_calendar_id,
            google_event_id=google_event_id,
            last_synced_at=last_synced_at,
        )
        return await self.update_async(updated_mapping)
