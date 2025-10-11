from dataclasses import dataclass
from datetime import datetime
from typing import Any

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from app.core.constants.secrets import (
    GOOGLE_OAUTH_CLIENT_ID,
    GOOGLE_OAUTH_CLIENT_SECRET,
)
from app.core.cryptography.google_tokens import GoogleTokenCryptography
from app.core.features.google_calendar import sanitize_rrule


@dataclass
class GoogleCalendarInfo:
    id: str
    summary: str


@dataclass
class GoogleCalendarEvent:
    id: str
    summary: str
    description: str | None
    location: str | None
    start: datetime
    end: datetime


class GoogleCalendarService:
    def __init__(self, token_crypto: GoogleTokenCryptography):
        self.token_crypto = token_crypto
        self._scopes = [
            "openid",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/calendar",
        ]

    def _build_credentials(self, encrypted_access_token: str, encrypted_refresh_token: str) -> Credentials:
        """Build Google OAuth2 credentials from encrypted tokens."""
        access_token = self.token_crypto.decrypt_token(encrypted_access_token)
        refresh_token = self.token_crypto.decrypt_token(encrypted_refresh_token)

        return Credentials(
            token=access_token,
            refresh_token=refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=GOOGLE_OAUTH_CLIENT_ID,
            client_secret=GOOGLE_OAUTH_CLIENT_SECRET,
            scopes=self._scopes,
        )

    def _refresh_credentials_if_needed(self, credentials: Credentials) -> tuple[Credentials, bool]:
        """Refresh credentials if needed. Returns (credentials, was_refreshed)."""
        if credentials.expired and credentials.refresh_token:
            credentials.refresh(Request())
            return credentials, True
        return credentials, False

    def get_refreshed_tokens(self, credentials: Credentials) -> tuple[str, str] | None:
        """Get refreshed and encrypted tokens if credentials were refreshed."""
        if credentials.token and credentials.refresh_token:
            encrypted_access = self.token_crypto.encrypt_token(credentials.token)
            encrypted_refresh = self.token_crypto.encrypt_token(credentials.refresh_token)
            return encrypted_access, encrypted_refresh
        return None

    async def get_user_info(self, encrypted_access_token: str, encrypted_refresh_token: str) -> dict[str, Any]:
        """Get Google user information for verification."""
        credentials = self._build_credentials(encrypted_access_token, encrypted_refresh_token)
        credentials, _ = self._refresh_credentials_if_needed(credentials)

        try:
            service = build("oauth2", "v2", credentials=credentials)
            user_info = service.userinfo().get().execute()
            return user_info  # type: ignore[no-any-return]
        except HttpError as e:
            raise ValueError(f"Failed to get user info: {e}")

    async def create_calendar(
        self,
        encrypted_access_token: str,
        encrypted_refresh_token: str,
        summary: str,
    ) -> GoogleCalendarInfo:
        """Create a new Google Calendar."""
        credentials = self._build_credentials(encrypted_access_token, encrypted_refresh_token)
        credentials, _ = self._refresh_credentials_if_needed(credentials)

        try:
            service = build("calendar", "v3", credentials=credentials)
            calendar_body = {"summary": summary}
            calendar = service.calendars().insert(body=calendar_body).execute()

            return GoogleCalendarInfo(
                id=calendar["id"],
                summary=calendar["summary"],
            )
        except HttpError as e:
            raise ValueError(f"Failed to create calendar: {e}")

    async def get_calendar_public_url(self, calendar_id: str) -> str:
        """Generate public URL for calendar subscription."""
        # Google Calendar public URL format for iCal subscription
        return f"https://calendar.google.com/calendar/ical/{calendar_id}/public/basic.ics"

    async def create_event(
        self,
        encrypted_access_token: str,
        encrypted_refresh_token: str,
        calendar_id: str,
        summary: str,
        start_time: datetime,
        end_time: datetime,
        description: str | None = None,
        location: str | None = None,
        recurrence: list[str] | None = None,
    ) -> GoogleCalendarEvent:
        """Create an event in Google Calendar."""
        credentials = self._build_credentials(encrypted_access_token, encrypted_refresh_token)
        credentials, _ = self._refresh_credentials_if_needed(credentials)

        try:
            service = build("calendar", "v3", credentials=credentials)
            event_body: dict[str, Any] = {
                "summary": summary,
                "description": description,
                "location": location,
                "start": {"dateTime": start_time.isoformat(), "timeZone": "UTC"},
                "end": {"dateTime": end_time.isoformat(), "timeZone": "UTC"},
            }

            if recurrence:
                event_body["recurrence"] = [sanitize_rrule(rule) for rule in recurrence]
            event = service.events().insert(calendarId=calendar_id, body=event_body).execute()

            return GoogleCalendarEvent(
                id=event["id"],
                summary=event["summary"],
                description=event.get("description"),
                location=event.get("location"),
                start=datetime.fromisoformat(event["start"]["dateTime"].replace("Z", "+00:00")),
                end=datetime.fromisoformat(event["end"]["dateTime"].replace("Z", "+00:00")),
            )
        except HttpError as e:
            raise ValueError(f"Failed to create event: {e}")

    async def update_event(
        self,
        encrypted_access_token: str,
        encrypted_refresh_token: str,
        calendar_id: str,
        event_id: str,
        summary: str | None = None,
        start_time: datetime | None = None,
        end_time: datetime | None = None,
        description: str | None = None,
        location: str | None = None,
        recurrence: list[str] | None = None,
    ) -> GoogleCalendarEvent:
        """Update an existing event in Google Calendar."""
        credentials = self._build_credentials(encrypted_access_token, encrypted_refresh_token)
        credentials, _ = self._refresh_credentials_if_needed(credentials)

        try:
            service = build("calendar", "v3", credentials=credentials)

            # Get existing event
            existing_event = service.events().get(calendarId=calendar_id, eventId=event_id).execute()

            # Update only provided fields
            if summary is not None:
                existing_event["summary"] = summary
            if description is not None:
                existing_event["description"] = description
            if location is not None:
                existing_event["location"] = location
            if start_time is not None:
                existing_event["start"] = {"dateTime": start_time.isoformat(), "timeZone": "UTC"}
            if end_time is not None:
                existing_event["end"] = {"dateTime": end_time.isoformat(), "timeZone": "UTC"}
            if recurrence is not None:
                existing_event["recurrence"] = [sanitize_rrule(rule) for rule in recurrence]

            updated_event = (
                service.events().update(calendarId=calendar_id, eventId=event_id, body=existing_event).execute()
            )

            return GoogleCalendarEvent(
                id=updated_event["id"],
                summary=updated_event["summary"],
                description=updated_event.get("description"),
                location=updated_event.get("location"),
                start=datetime.fromisoformat(updated_event["start"]["dateTime"].replace("Z", "+00:00")),
                end=datetime.fromisoformat(updated_event["end"]["dateTime"].replace("Z", "+00:00")),
            )
        except HttpError as e:
            raise ValueError(f"Failed to update event: {e}")

    async def delete_event(
        self,
        encrypted_access_token: str,
        encrypted_refresh_token: str,
        calendar_id: str,
        event_id: str,
    ) -> None:
        """Delete an event from Google Calendar."""
        credentials = self._build_credentials(encrypted_access_token, encrypted_refresh_token)
        credentials, _ = self._refresh_credentials_if_needed(credentials)

        try:
            service = build("calendar", "v3", credentials=credentials)
            service.events().delete(calendarId=calendar_id, eventId=event_id).execute()
        except HttpError as e:
            raise ValueError(f"Failed to delete event: {e}")
