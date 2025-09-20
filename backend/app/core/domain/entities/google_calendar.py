from datetime import datetime

from app.core.domain.entities.base import IEntity
from app.core.features.google_calendar import GoogleCalendarSyncStatus
from app.core.utils.uuid import UUID


class GoogleCalendarIntegration(IEntity):
    def __init__(
        self,
        entity_id: UUID,
        user_id: UUID,
        google_user_id: str,
        google_email: str,
        encrypted_access_token: str,
        encrypted_refresh_token: str,
        token_expires_at: datetime,
        calendar_id: str,
        calendar_url: str,
        sync_status: GoogleCalendarSyncStatus,
        last_sync_at: datetime | None,
        last_error: str | None,
    ) -> None:
        super().__init__(entity_id)
        self.user_id = user_id
        self.google_user_id = google_user_id
        self.google_email = google_email
        self.encrypted_access_token = encrypted_access_token
        self.encrypted_refresh_token = encrypted_refresh_token
        self.token_expires_at = token_expires_at
        self.calendar_id = calendar_id
        self.calendar_url = calendar_url
        self.sync_status = sync_status
        self.last_sync_at = last_sync_at
        self.last_error = last_error
