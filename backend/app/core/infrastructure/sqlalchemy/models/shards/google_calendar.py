from datetime import datetime

from sqlalchemy.dialects.mysql import DATETIME, ENUM, TEXT, VARCHAR
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm.base import Mapped

from app.core.domain.entities.google_calendar import GoogleCalendarIntegration as GoogleCalendarIntegrationEntity
from app.core.features.google_calendar import GoogleCalendarSyncStatus
from app.core.infrastructure.sqlalchemy.models.shards.base import AbstractShardDynamicBase
from app.core.utils.uuid import bin_to_uuid, uuid_to_bin


class GoogleCalendarIntegration(AbstractShardDynamicBase):
    google_user_id: Mapped[str] = mapped_column(VARCHAR(255), unique=True, nullable=False, comment="Google User ID")
    google_email: Mapped[str] = mapped_column(VARCHAR(255), nullable=False, comment="Google Email")
    encrypted_access_token: Mapped[str] = mapped_column(TEXT, nullable=False, comment="Encrypted Access Token")
    encrypted_refresh_token: Mapped[str] = mapped_column(TEXT, nullable=False, comment="Encrypted Refresh Token")
    token_expires_at: Mapped[datetime] = mapped_column(DATETIME(timezone=True), nullable=False, comment="Token Expiry")
    calendar_id: Mapped[str] = mapped_column(VARCHAR(255), nullable=False, comment="Google Calendar ID")
    calendar_url: Mapped[str] = mapped_column(VARCHAR(512), nullable=False, comment="Public Calendar URL")
    sync_status: Mapped[GoogleCalendarSyncStatus] = mapped_column(
        ENUM(GoogleCalendarSyncStatus), nullable=False, comment="Sync Status"
    )
    last_sync_at: Mapped[datetime | None] = mapped_column(
        DATETIME(timezone=True), nullable=True, comment="Last Sync Time"
    )
    last_error: Mapped[str | None] = mapped_column(TEXT, nullable=True, comment="Last Error Message")

    def to_entity(self) -> GoogleCalendarIntegrationEntity:
        return GoogleCalendarIntegrationEntity(
            entity_id=bin_to_uuid(self.id),
            user_id=self.user_id,
            google_user_id=self.google_user_id,
            google_email=self.google_email,
            encrypted_access_token=self.encrypted_access_token,
            encrypted_refresh_token=self.encrypted_refresh_token,
            token_expires_at=self.token_expires_at,
            calendar_id=self.calendar_id,
            calendar_url=self.calendar_url,
            sync_status=self.sync_status,
            last_sync_at=self.last_sync_at,
            last_error=self.last_error,
        )

    @classmethod
    def from_entity(cls, entity: GoogleCalendarIntegrationEntity) -> "GoogleCalendarIntegration":
        return cls(
            id=uuid_to_bin(entity.id),
            user_id=entity.user_id,
            google_user_id=entity.google_user_id,
            google_email=entity.google_email,
            encrypted_access_token=entity.encrypted_access_token,
            encrypted_refresh_token=entity.encrypted_refresh_token,
            token_expires_at=entity.token_expires_at,
            calendar_id=entity.calendar_id,
            calendar_url=entity.calendar_url,
            sync_status=entity.sync_status,
            last_sync_at=entity.last_sync_at,
            last_error=entity.last_error,
        )
