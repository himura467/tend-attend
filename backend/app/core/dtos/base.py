from pydantic import BaseModel
from pydantic.fields import Field


class BaseModelWithErrorCodes(BaseModel):
    error_codes: list[int] = Field(..., title="Error Codes")
