from datetime import datetime

from pydantic import BaseModel
from pydantic.fields import Field

from app.core.dtos.base import BaseModelWithErrorCodes
from app.core.features.event import AttendanceAction


class Event(BaseModel):
    summary: str = Field(..., title="Summary")
    location: str | None = Field(None, title="Location")
    dtstart: datetime = Field(..., title="DTSTART")
    dtend: datetime = Field(..., title="DTEND")
    is_all_day: bool = Field(True, title="Is All Day")
    recurrence_list: list[str] = Field(..., title="Recurrence List")
    timezone: str = Field(..., title="Timezone")


class EventWithId(Event):
    id: str = Field(..., title="Event ID")


class Attendance(BaseModel):
    action: AttendanceAction = Field(..., title="Attendance Action")
    acted_at: datetime = Field(..., title="Acted At")


class AttendancesWithUsername(BaseModel):
    username: str = Field(..., title="Username")
    attendances: list[Attendance] = Field(..., title="Attendances")


class AttendanceTimeForecast(BaseModel):
    start: datetime = Field(..., title="Event Started At")
    attended_at: datetime = Field(..., title="Attended At")
    duration: float = Field(..., title="Attendance Duration")


class AttendanceTimeForecastsWithUsername(BaseModel):
    username: str = Field(..., title="Username")
    attendance_time_forecasts: list[AttendanceTimeForecast] = Field(..., title="Attendance Time Forecasts")


class CreateEventRequest(BaseModel):
    event: Event = Field(..., title="Event")


class CreateEventResponse(BaseModelWithErrorCodes):
    pass


class UpdateEventRequest(BaseModel):
    event: Event = Field(..., title="Event")


class UpdateEventResponse(BaseModelWithErrorCodes):
    pass


class AttendEventRequest(BaseModel):
    action: AttendanceAction = Field(..., title="Attendance Action")


class AttendEventResponse(BaseModelWithErrorCodes):
    pass


class UpdateAttendancesRequest(BaseModel):
    attendances: list[Attendance] = Field(..., title="Attendances")


class UpdateAttendancesResponse(BaseModelWithErrorCodes):
    pass


class GetAttendanceHistoryResponse(BaseModelWithErrorCodes):
    attendances_with_username: AttendancesWithUsername = Field(..., title="Attendances with Username")


class GetMyEventsResponse(BaseModelWithErrorCodes):
    events: list[EventWithId] = Field(..., title="My Events")


class GetFollowingEventsResponse(BaseModelWithErrorCodes):
    events: list[EventWithId] = Field(..., title="Following Events")


class GetGuestAttendanceStatusResponse(BaseModelWithErrorCodes):
    attend: bool = Field(..., title="Is Attending")


class ForecastAttendanceTimeResponse(BaseModelWithErrorCodes):
    attendance_time_forecasts: dict[int, dict[str, list[AttendanceTimeForecast]]] = Field(
        ..., title="Attendance Time Forecasts"
    )


class GetAttendanceTimeForecastsResponse(BaseModelWithErrorCodes):
    attendance_time_forecasts_with_username: dict[str, dict[int, AttendanceTimeForecastsWithUsername]] = Field(
        ..., title="Attendance Time Forecasts with Username"
    )


class CreateOrUpdateGoalRequest(BaseModel):
    goal_text: str = Field(..., title="Goal Text")


class CreateOrUpdateGoalResponse(BaseModelWithErrorCodes):
    pass


class GetGuestGoalResponse(BaseModelWithErrorCodes):
    goal_text: str = Field(..., title="Goal Text")


class CreateOrUpdateReviewRequest(BaseModel):
    review_text: str = Field(..., title="Review Text")


class CreateOrUpdateReviewResponse(BaseModelWithErrorCodes):
    pass


class GetGuestReviewResponse(BaseModelWithErrorCodes):
    review_text: str = Field(..., title="Review Text")
