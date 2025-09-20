from datetime import datetime

from pydantic import BaseModel
from pydantic.fields import Field

from app.core.dtos.base import BaseModelWithErrorCodes
from app.core.features.google_calendar import GoogleCalendarSyncStatus


class FolloweeCalendarInfo(BaseModel):
    username: str = Field(..., title="Followee Username")
    nickname: str | None = Field(None, title="Followee Nickname")
    calendar_url: str = Field(..., title="Public Calendar URL")
    last_sync_at: datetime | None = Field(None, title="Last Sync Time")


class GoogleCalendarOAuthRequest(BaseModel):
    auth_code: str = Field(..., title="Google OAuth Authorization Code")
    state: str | None = Field(None, title="OAuth State Parameter")


class GoogleCalendarOAuthResponse(BaseModelWithErrorCodes):
    integration_id: str | None = Field(None, title="Integration ID")
    calendar_url: str | None = Field(None, title="Public Calendar URL")


class GoogleCalendarStatusRequest(BaseModel):
    pass


class GoogleCalendarStatusResponse(BaseModelWithErrorCodes):
    integration_id: str | None = Field(None, title="Integration ID")
    google_email: str | None = Field(None, title="Google Email")
    calendar_url: str | None = Field(None, title="Public Calendar URL")
    sync_status: GoogleCalendarSyncStatus | None = Field(None, title="Sync Status")
    last_sync_at: datetime | None = Field(None, title="Last Sync Time")
    last_error: str | None = Field(None, title="Last Error Message")


class GoogleCalendarDisconnectRequest(BaseModel):
    pass


class GoogleCalendarDisconnectResponse(BaseModelWithErrorCodes):
    pass


class GoogleCalendarSyncRequest(BaseModel):
    force_sync: bool = Field(False, title="Force Full Sync")


class GoogleCalendarSyncResponse(BaseModelWithErrorCodes):
    sync_status: GoogleCalendarSyncStatus | None = Field(None, title="Sync Status")
    events_synced: int | None = Field(None, title="Number of Events Synced")
    last_sync_at: datetime | None = Field(None, title="Last Sync Time")


class FolloweeCalendarsRequest(BaseModel):
    pass


class FolloweeCalendarsResponse(BaseModelWithErrorCodes):
    calendars: list[FolloweeCalendarInfo] = Field(default_factory=list, title="Followee Calendars")
