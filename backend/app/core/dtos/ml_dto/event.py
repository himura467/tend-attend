from datetime import datetime

from pydantic import BaseModel, field_serializer

from app.core.features.event import AttendanceAction, Frequency


class RecurrenceRule(BaseModel):
    id: str
    freq: Frequency


class Recurrence(BaseModel):
    id: str
    rrule: RecurrenceRule


class Event(BaseModel):
    id: str
    user_id: int
    dtstart: datetime
    dtend: datetime
    timezone: str
    recurrence: Recurrence | None

    @field_serializer("dtstart")
    def serialize_dtstart(self, dtstart: datetime) -> str:
        return dtstart.isoformat()

    @field_serializer("dtend")
    def serialize_dtend(self, dtend: datetime) -> str:
        return dtend.isoformat()


class EventAttendanceActionLog(BaseModel):
    id: str
    user_id: int
    event_id: str
    start: datetime
    action: AttendanceAction
    acted_at: datetime

    @field_serializer("start")
    def serialize_start(self, start: datetime) -> str:
        return start.isoformat()

    @field_serializer("acted_at")
    def serialize_acted_at(self, acted_at: datetime) -> str:
        return acted_at.isoformat()
