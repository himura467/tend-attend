from pydantic import BaseModel
from pydantic.networks import EmailStr

from core.dtos.base import BaseModelWithErrorCodes


class RequestEmailVerificationRequest(BaseModel):
    email: EmailStr


class RequestEmailVerificationResponse(BaseModelWithErrorCodes):
    pass


class VerifyEmailRequest(BaseModel):
    email: EmailStr
    verification_token: str


class VerifyEmailResponse(BaseModelWithErrorCodes):
    pass
