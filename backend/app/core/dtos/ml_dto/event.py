from datetime import datetime

from pydantic import BaseModel, field_serializer

from core.features.event import AttendanceAction, Frequency


class RecurrenceRule(BaseModel):
    id: str
    freq: Frequency


class Recurrence(BaseModel):
    id: str
    rrule: RecurrenceRule


class Event(BaseModel):
    id: str
    user_id: int
    start: datetime
    end: datetime
    timezone: str
    recurrence: Recurrence

    @field_serializer("start")
    def serialize_start(self, start: datetime) -> str:
        return start.isoformat()

    @field_serializer("end")
    def serialize_end(self, end: datetime) -> str:
        return end.isoformat()


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
