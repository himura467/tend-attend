from pydantic.fields import Field

from app.core.dtos.base import BaseModelWithErrorCodes


class AuthSessionResponse(BaseModelWithErrorCodes):
    session_token: str | None = Field(None, title="Session Token")
    max_age: int = Field(..., title="Max Age")


class CreateAuthSessionResponse(BaseModelWithErrorCodes):
    pass


class RevokeAuthSessionResponse(BaseModelWithErrorCodes):
    pass


class GetAuthStatusResponse(BaseModelWithErrorCodes):
    username: str | None = Field(None, title="Username")
    group: str | None = Field(None, title="Group")
