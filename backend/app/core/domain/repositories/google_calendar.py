from abc import ABCMeta, abstractmethod
from datetime import datetime
from typing import Any

from app.core.domain.entities.google_calendar import GoogleCalendarIntegration as GoogleCalendarIntegrationEntity
from app.core.domain.repositories.base import IRepository, ModelProtocol
from app.core.features.google_calendar import GoogleCalendarSyncStatus
from app.core.utils.uuid import UUID


class IGoogleCalendarIntegrationRepository(IRepository[GoogleCalendarIntegrationEntity, ModelProtocol[Any]], metaclass=ABCMeta):
    @abstractmethod
    async def read_by_user_id_or_none_async(self, user_id: int) -> GoogleCalendarIntegrationEntity | None:
        raise NotImplementedError()

    @abstractmethod
    async def read_by_google_user_id_or_none_async(self, google_user_id: str) -> GoogleCalendarIntegrationEntity | None:
        raise NotImplementedError()

    @abstractmethod
    async def update_tokens_async(
        self,
        integration_id: UUID,
        encrypted_access_token: str,
        encrypted_refresh_token: str,
        token_expires_at: datetime,
    ) -> GoogleCalendarIntegrationEntity | None:
        raise NotImplementedError()

    @abstractmethod
    async def update_sync_status_async(
        self,
        integration_id: UUID,
        sync_status: GoogleCalendarSyncStatus,
        last_sync_at: datetime | None = None,
        last_error: str | None = None,
    ) -> GoogleCalendarIntegrationEntity | None:
        raise NotImplementedError()
