from datetime import datetime

from app.core.domain.entities.base import IEntity
from app.core.features.google_calendar import GoogleCalendarSyncStatus
from app.core.utils.uuid import UUID


class GoogleCalendarIntegration(IEntity):
    def __init__(
        self,
        entity_id: UUID,
        user_id: int,
        google_user_id: str,
        google_email: str,
        encrypted_access_token: str,
        encrypted_refresh_token: str,
        token_expires_at: datetime,
        calendar_id: str,
        calendar_url: str,
        sync_status: GoogleCalendarSyncStatus,
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


class GoogleCalendarEventMapping(IEntity):
    def __init__(
        self,
        entity_id: UUID,
        user_id: int,
        event_id: UUID,
        google_calendar_id: str,
        google_event_id: str,
        last_synced_at: datetime,
    ) -> None:
        super().__init__(entity_id)
        self.user_id = user_id
        self.event_id = event_id
        self.google_calendar_id = google_calendar_id
        self.google_event_id = google_event_id
        self.last_synced_at = last_synced_at
