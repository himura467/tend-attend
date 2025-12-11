from datetime import datetime

from pydantic import BaseModel
from pydantic.fields import Field
from pydantic.networks import EmailStr

from app.core.dtos.base import BaseModelWithErrorCodes
from app.core.features.account import Gender


class CreateUserAccountRequest(BaseModel):
    username: str = Field(
        ...,
        title="Username",
        description="Username (1-32 characters, alphanumeric and underscore only)",
        pattern=r"^[a-zA-Z0-9_]+$",
        min_length=1,
        max_length=32,
    )
    password: str = Field(..., title="Password")
    nickname: str | None = Field(None, title="Nickname")
    birth_date: datetime = Field(..., title="Birth Date")
    gender: Gender = Field(..., title="Gender")
    email: EmailStr = Field(..., title="Email")
    followee_usernames: list[str] = Field(..., title="Followee Usernames")


class CreateUserAccountResponse(BaseModelWithErrorCodes):
    pass


class FollowerInfo(BaseModel):
    account_id: str = Field(..., title="Account ID")
    username: str = Field(..., title="Username")
    nickname: str | None = Field(None, title="Nickname")


class GetFollowersInfoResponse(BaseModelWithErrorCodes):
    followers: list[FollowerInfo] = Field(..., title="Followers Info")
