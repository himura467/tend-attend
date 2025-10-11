from datetime import datetime

from pydantic import BaseModel
from pydantic.fields import Field

from app.core.dtos.base import BaseModelWithErrorCodes
from app.core.features.google_calendar import GoogleCalendarSyncStatus


class FolloweeCalendarInfo(BaseModel):
    username: str = Field(..., title="Followee Username")
    nickname: str | None = Field(None, title="Followee Nickname")
    calendar_url: str = Field(..., title="Public Calendar URL")


class GetGoogleCalendarAuthUrlResponse(BaseModelWithErrorCodes):
    authorization_url: str = Field(..., title="Google OAuth Authorization URL")


class HandleGoogleCalendarOAuthCallbackRequest(BaseModel):
    auth_code: str = Field(..., title="Google OAuth Authorization Code")


class HandleGoogleCalendarOAuthCallbackResponse(BaseModelWithErrorCodes):
    integration_id: str | None = Field(None, title="Integration ID")
    calendar_url: str | None = Field(None, title="Public Calendar URL")


class GetGoogleCalendarStatusResponse(BaseModelWithErrorCodes):
    integration_id: str | None = Field(None, title="Integration ID")
    google_email: str | None = Field(None, title="Google Email")
    calendar_url: str | None = Field(None, title="Public Calendar URL")
    sync_status: GoogleCalendarSyncStatus | None = Field(None, title="Sync Status")


class DisconnectGoogleCalendarResponse(BaseModelWithErrorCodes):
    pass


class SyncGoogleCalendarResponse(BaseModelWithErrorCodes):
    sync_status: GoogleCalendarSyncStatus | None = Field(None, title="Sync Status")
    events_synced: int | None = Field(None, title="Number of Events Synced")


class GetFolloweeCalendarsResponse(BaseModelWithErrorCodes):
    calendars: list[FolloweeCalendarInfo] = Field(default_factory=list, title="Followee Calendars")
