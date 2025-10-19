from dataclasses import dataclass
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build

from app.core.constants.secrets import (
    GOOGLE_OAUTH_CLIENT_ID,
    GOOGLE_OAUTH_CLIENT_SECRET,
    GOOGLE_OAUTH_REDIRECT_URI,
)


@dataclass
class GoogleOAuthTokens:
    access_token: str
    refresh_token: str
    expires_at: datetime
    user_id: str
    email: str


class GoogleOAuthFlow:
    def __init__(self) -> None:
        self._scopes = [
            "openid",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/calendar",
        ]
        self._client_config = {
            "web": {
                "client_id": GOOGLE_OAUTH_CLIENT_ID,
                "client_secret": GOOGLE_OAUTH_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [GOOGLE_OAUTH_REDIRECT_URI],
            }
        }

    def get_authorization_url(self, state: str | None = None) -> str:
        """Generate Google OAuth authorization URL."""
        flow = Flow.from_client_config(
            self._client_config,
            scopes=self._scopes,
            redirect_uri=GOOGLE_OAUTH_REDIRECT_URI,
        )

        auth_url, _ = flow.authorization_url(
            access_type="offline",
            include_granted_scopes="true",
            state=state,
            prompt="consent",  # Force consent to ensure refresh token is provided
        )

        return auth_url  # type: ignore[no-any-return]

    async def exchange_code_for_tokens(self, auth_code: str) -> GoogleOAuthTokens:
        """Exchange authorization code for access and refresh tokens."""
        flow = Flow.from_client_config(
            self._client_config,
            scopes=self._scopes,
            redirect_uri=GOOGLE_OAUTH_REDIRECT_URI,
        )

        try:
            # Exchange authorization code for tokens
            flow.fetch_token(code=auth_code)
            credentials = flow.credentials

            oauth2_service = build("oauth2", "v2", credentials=credentials)
            user_info = oauth2_service.userinfo().get().execute()

            # Calculate token expiration
            if credentials.expiry:
                expires_at = credentials.expiry
            else:
                # Default to 1 hour if no expiry is provided
                expires_at = datetime.now(ZoneInfo("UTC")) + timedelta(hours=1)

            return GoogleOAuthTokens(
                access_token=credentials.token,
                refresh_token=credentials.refresh_token or "",
                expires_at=expires_at,
                user_id=user_info["id"],
                email=user_info["email"],
            )

        except Exception as e:
            raise ValueError(f"Failed to exchange authorization code: {e}")

    async def refresh_access_token(self, refresh_token: str) -> GoogleOAuthTokens:
        """Refresh access token using refresh token."""
        try:
            credentials = Credentials(
                token=None,
                refresh_token=refresh_token,
                token_uri="https://oauth2.googleapis.com/token",
                client_id=GOOGLE_OAUTH_CLIENT_ID,
                client_secret=GOOGLE_OAUTH_CLIENT_SECRET,
            )

            # Refresh the credentials
            credentials.refresh(Request())

            oauth2_service = build("oauth2", "v2", credentials=credentials)
            user_info = oauth2_service.userinfo().get().execute()

            # Validate token was obtained
            if not credentials.token:
                raise ValueError("Failed to obtain access token during refresh")

            # Calculate token expiration
            if credentials.expiry:
                expires_at = credentials.expiry
            else:
                # Default to 1 hour if no expiry is provided
                expires_at = datetime.now(ZoneInfo("UTC")) + timedelta(hours=1)

            return GoogleOAuthTokens(
                access_token=credentials.token,
                refresh_token=credentials.refresh_token or refresh_token,
                expires_at=expires_at,
                user_id=user_info["id"],
                email=user_info["email"],
            )

        except Exception as e:
            raise ValueError(f"Failed to refresh access token: {e}")

    def validate_tokens(self, access_token: str) -> bool:
        """Validate if the access token is still valid."""
        try:
            credentials = Credentials(token=access_token)

            oauth2_service = build("oauth2", "v2", credentials=credentials)
            oauth2_service.userinfo().get().execute()
            return True
        except Exception:
            return False
