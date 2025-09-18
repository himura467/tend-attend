from datetime import datetime

from sqlalchemy.dialects.mysql import (
    BINARY,
    BOOLEAN,
    DATETIME,
    DOUBLE,
    ENUM,
    JSON,
    SMALLINT,
    VARCHAR,
)
from sqlalchemy.exc import StatementError
from sqlalchemy.orm import mapped_column, relationship
from sqlalchemy.orm.base import Mapped
from sqlalchemy.sql.schema import ForeignKey, Index, UniqueConstraint

from app.core.domain.entities.event import Event as EventEntity
from app.core.domain.entities.event import EventAttendance as EventAttendanceEntity
from app.core.domain.entities.event import (
    EventAttendanceActionLog as EventAttendanceActionLogEntity,
)
from app.core.domain.entities.event import (
    EventAttendanceForecast as EventAttendanceForecastEntity,
)
from app.core.domain.entities.event import Recurrence as RecurrenceEntity
from app.core.domain.entities.event import RecurrenceRule as RecurrenceRuleEntity
from app.core.features.event import (
    AttendanceAction,
    AttendanceState,
    Frequency,
    Weekday,
)
from app.core.infrastructure.sqlalchemy.models.shards.base import (
    AbstractShardDynamicBase,
    AbstractShardStaticBase,
)
from app.core.utils.uuid import bin_to_uuid, uuid_to_bin


class RecurrenceRule(AbstractShardStaticBase):
    freq: Mapped[Frequency] = mapped_column(ENUM(Frequency), nullable=False, comment="FREQ")
    until: Mapped[datetime | None] = mapped_column(DATETIME(timezone=False), nullable=True, comment="UNTIL")
    count: Mapped[int | None] = mapped_column(SMALLINT(unsigned=True), nullable=True, comment="COUNT")
    interval: Mapped[int] = mapped_column(SMALLINT(unsigned=True), nullable=False, comment="INTERVAL")
    bysecond: Mapped[list[int] | None] = mapped_column(JSON, nullable=True, comment="BYSECOND")
    byminute: Mapped[list[int] | None] = mapped_column(JSON, nullable=True, comment="BYMINUTE")
    byhour: Mapped[list[int] | None] = mapped_column(JSON, nullable=True, comment="BYHOUR")
    byday: Mapped[list[list[int | Weekday]] | None] = mapped_column(JSON, nullable=True, comment="BYDAY")
    bymonthday: Mapped[list[int] | None] = mapped_column(JSON, nullable=True, comment="BYMONTHDAY")
    byyearday: Mapped[list[int] | None] = mapped_column(JSON, nullable=True, comment="BYYEARDAY")
    byweekno: Mapped[list[int] | None] = mapped_column(JSON, nullable=True, comment="BYWEEKNO")
    bymonth: Mapped[list[int] | None] = mapped_column(JSON, nullable=True, comment="BYMONTH")
    bysetpos: Mapped[list[int] | None] = mapped_column(JSON, nullable=True, comment="BYSETPOS")
    wkst: Mapped[Weekday | None] = mapped_column(ENUM(Weekday), nullable=True, comment="WKST")

    def to_entity(self) -> RecurrenceRuleEntity:
        return RecurrenceRuleEntity(
            entity_id=bin_to_uuid(self.id),
            user_id=self.user_id,
            freq=self.freq,
            until=self.until,
            count=self.count,
            interval=self.interval,
            bysecond=self.bysecond,
            byminute=self.byminute,
            byhour=self.byhour,
            byday=[(int(i[0]), Weekday(str(i[1]))) for i in self.byday] if self.byday is not None else None,
            bymonthday=self.bymonthday,
            byyearday=self.byyearday,
            byweekno=self.byweekno,
            bymonth=self.bymonth,
            bysetpos=self.bysetpos,
            wkst=self.wkst,
        )

    @classmethod
    def from_entity(cls, entity: RecurrenceRuleEntity) -> "RecurrenceRule":
        return cls(
            id=uuid_to_bin(entity.id),
            user_id=entity.user_id,
            freq=entity.freq,
            until=entity.until,
            count=entity.count,
            interval=entity.interval,
            bysecond=entity.bysecond,
            byminute=entity.byminute,
            byhour=entity.byhour,
            byday=[list(i) for i in entity.byday] if entity.byday is not None else None,
            bymonthday=entity.bymonthday,
            byyearday=entity.byyearday,
            byweekno=entity.byweekno,
            bymonth=entity.bymonth,
            bysetpos=entity.bysetpos,
            wkst=entity.wkst,
        )


class Recurrence(AbstractShardStaticBase):
    rrule_id: Mapped[bytes] = mapped_column(
        BINARY(16),
        ForeignKey("recurrence_rule.id", ondelete="CASCADE"),
        nullable=False,
    )
    rrule: Mapped[RecurrenceRule] = relationship(uselist=False)
    rdate: Mapped[list[str]] = mapped_column(JSON, nullable=False, comment="RDATE")
    exdate: Mapped[list[str]] = mapped_column(JSON, nullable=False, comment="EXDATE")

    def to_entity(self) -> RecurrenceEntity:
        rrule = self.rrule.to_entity()

        return RecurrenceEntity(
            entity_id=bin_to_uuid(self.id),
            user_id=self.user_id,
            rrule_id=bin_to_uuid(self.rrule_id),
            rrule=rrule,
            rdate=[datetime.fromisoformat(dt_str) for dt_str in self.rdate],
            exdate=[datetime.fromisoformat(dt_str) for dt_str in self.exdate],
        )

    @classmethod
    def from_entity(cls, entity: RecurrenceEntity) -> "Recurrence":
        return cls(
            id=uuid_to_bin(entity.id),
            user_id=entity.user_id,
            rrule_id=uuid_to_bin(entity.rrule_id),
            rdate=[dt.isoformat() for dt in entity.rdate],
            exdate=[dt.isoformat() for dt in entity.exdate],
        )


class Event(AbstractShardDynamicBase):
    summary: Mapped[str] = mapped_column(VARCHAR(63), unique=True, nullable=False, comment="Summary")
    location: Mapped[str | None] = mapped_column(VARCHAR(63), nullable=True, comment="Location")
    dtstart: Mapped[datetime] = mapped_column(DATETIME(timezone=True), nullable=False, comment="DTSTART")
    dtend: Mapped[datetime] = mapped_column(DATETIME(timezone=True), nullable=False, comment="DTEND")
    is_all_day: Mapped[bool] = mapped_column(BOOLEAN, nullable=False, comment="Is All Day")
    recurrence_id: Mapped[bytes | None] = mapped_column(
        BINARY(16),
        ForeignKey("recurrence.id", ondelete="CASCADE"),
        nullable=True,
    )
    timezone: Mapped[str] = mapped_column(VARCHAR(63), nullable=False, comment="Timezone")
    recurrence: Mapped[Recurrence | None] = relationship(uselist=False)

    def to_entity(self) -> EventEntity:
        try:
            recurrence = self.recurrence.to_entity() if self.recurrence else None
        except StatementError:
            recurrence = None

        return EventEntity(
            entity_id=bin_to_uuid(self.id),
            user_id=self.user_id,
            summary=self.summary,
            location=self.location,
            dtstart=self.dtstart,
            dtend=self.dtend,
            is_all_day=self.is_all_day,
            recurrence_id=(bin_to_uuid(self.recurrence_id) if self.recurrence_id else None),
            timezone=self.timezone,
            recurrence=recurrence,
        )

    @classmethod
    def from_entity(cls, entity: EventEntity) -> "Event":
        return cls(
            id=uuid_to_bin(entity.id),
            user_id=entity.user_id,
            summary=entity.summary,
            location=entity.location,
            dtstart=entity.dtstart,
            dtend=entity.dtend,
            is_all_day=entity.is_all_day,
            recurrence_id=(uuid_to_bin(entity.recurrence_id) if entity.recurrence_id else None),
            timezone=entity.timezone,
        )


Index(None, Event.user_id)


class EventAttendance(AbstractShardDynamicBase):
    event_id: Mapped[bytes] = mapped_column(
        BINARY(16),
        nullable=False,
        comment="Event ID",
    )
    start: Mapped[datetime] = mapped_column(DATETIME(timezone=True), nullable=False, comment="Start")
    state: Mapped[AttendanceState] = mapped_column(ENUM(AttendanceState), nullable=False, comment="Attendance State")

    def to_entity(self) -> EventAttendanceEntity:
        return EventAttendanceEntity(
            entity_id=bin_to_uuid(self.id),
            user_id=self.user_id,
            event_id=bin_to_uuid(self.event_id),
            start=self.start,
            state=self.state,
        )

    @classmethod
    def from_entity(cls, entity: EventAttendanceEntity) -> "EventAttendance":
        return cls(
            id=uuid_to_bin(entity.id),
            user_id=entity.user_id,
            event_id=uuid_to_bin(entity.event_id),
            start=entity.start,
            state=entity.state,
        )


UniqueConstraint(EventAttendance.user_id, EventAttendance.event_id, EventAttendance.start)


class EventAttendanceActionLog(AbstractShardDynamicBase):
    event_id: Mapped[bytes] = mapped_column(
        BINARY(16),
        nullable=False,
        comment="Event ID",
    )
    start: Mapped[datetime] = mapped_column(DATETIME(timezone=True), nullable=False, comment="Start")
    action: Mapped[AttendanceAction] = mapped_column(
        ENUM(AttendanceAction), nullable=False, comment="Attendance Action"
    )
    acted_at: Mapped[datetime] = mapped_column(DATETIME(timezone=True), nullable=False, comment="Acted At")

    def to_entity(self) -> EventAttendanceActionLogEntity:
        return EventAttendanceActionLogEntity(
            entity_id=bin_to_uuid(self.id),
            user_id=self.user_id,
            event_id=bin_to_uuid(self.event_id),
            start=self.start,
            action=self.action,
            acted_at=self.acted_at,
        )

    @classmethod
    def from_entity(cls, entity: EventAttendanceActionLogEntity) -> "EventAttendanceActionLog":
        return cls(
            id=uuid_to_bin(entity.id),
            user_id=entity.user_id,
            event_id=uuid_to_bin(entity.event_id),
            start=entity.start,
            action=entity.action,
            acted_at=entity.acted_at,
        )


Index(
    None,
    EventAttendanceActionLog.user_id,
    EventAttendanceActionLog.event_id,
    EventAttendanceActionLog.start,
)


class EventAttendanceForecast(AbstractShardDynamicBase):
    event_id: Mapped[bytes] = mapped_column(
        BINARY(16),
        nullable=False,
        comment="Event ID",
    )
    start: Mapped[datetime] = mapped_column(DATETIME(timezone=True), nullable=False, comment="Event Start Time")
    forecasted_attended_at: Mapped[datetime] = mapped_column(
        DATETIME(timezone=True), nullable=False, comment="Forecasted Attendance Time"
    )
    forecasted_duration: Mapped[float] = mapped_column(DOUBLE, nullable=False, comment="Forecasted Duration in Seconds")

    def to_entity(self) -> "EventAttendanceForecastEntity":
        return EventAttendanceForecastEntity(
            entity_id=bin_to_uuid(self.id),
            user_id=self.user_id,
            event_id=bin_to_uuid(self.event_id),
            start=self.start,
            forecasted_attended_at=self.forecasted_attended_at,
            forecasted_duration=self.forecasted_duration,
        )

    @classmethod
    def from_entity(cls, entity: "EventAttendanceForecastEntity") -> "EventAttendanceForecast":
        return cls(
            id=uuid_to_bin(entity.id),
            user_id=entity.user_id,
            event_id=uuid_to_bin(entity.event_id),
            start=entity.start,
            forecasted_attended_at=entity.forecasted_attended_at,
            forecasted_duration=entity.forecasted_duration,
        )


UniqueConstraint(
    EventAttendanceForecast.user_id,
    EventAttendanceForecast.event_id,
    EventAttendanceForecast.start,
)
