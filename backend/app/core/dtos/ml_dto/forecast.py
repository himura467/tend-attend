from pydantic import BaseModel

from app.core.dtos.ml_dto.account import UserAccount
from app.core.dtos.ml_dto.event import Event, EventAttendanceActionLog


class ForecastAttendanceTimeRequest(BaseModel):
    earliest_attend_data: list[EventAttendanceActionLog]
    latest_leave_data: list[EventAttendanceActionLog]
    event_data: list[Event]
    user_data: list[UserAccount]
