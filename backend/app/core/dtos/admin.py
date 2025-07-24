from pydantic import BaseModel
from pydantic.fields import Field

from app.core.dtos.base import BaseModelWithErrorCodes


class ResetAuroraResponse(BaseModelWithErrorCodes):
    pass


class UpgradeDbResponse(BaseModelWithErrorCodes):
    pass


class StampRevisionRequest(BaseModel):
    revision: str = Field("head", title="Revision")


class StampRevisionResponse(BaseModelWithErrorCodes):
    pass
