from alembic import command
from fastapi import APIRouter, Depends

from app.api.deps import verify_admin_credentials
from app.core.dtos.admin import (
    ResetAuroraResponse,
    StampRevisionRequest,
    StampRevisionResponse,
    UpgradeDbResponse,
)
from app.core.infrastructure.sqlalchemy.migrate_db import reset_aurora_db
from app.core.utils.alembic import get_alembic_config

router = APIRouter()


@router.post(
    path="/aurora/reset",
    name="Reset Aurora DB",
    response_model=ResetAuroraResponse,
)
def reset_aurora(_: bool = Depends(verify_admin_credentials)) -> ResetAuroraResponse:
    reset_aurora_db()
    return ResetAuroraResponse(error_codes=[])


@router.post(
    path="/migration/upgrade",
    name="Upgrade DB",
    response_model=UpgradeDbResponse,
)
def upgrade_db(_: bool = Depends(verify_admin_credentials)) -> UpgradeDbResponse:
    alembic_config = get_alembic_config()
    command.upgrade(alembic_config, "head")

    return UpgradeDbResponse(error_codes=[])


@router.post(
    path="/migration/stamp",
    name="Stamp Revision",
    response_model=StampRevisionResponse,
)
def stamp_revision(req: StampRevisionRequest, _: bool = Depends(verify_admin_credentials)) -> StampRevisionResponse:
    revision = req.revision

    alembic_config = get_alembic_config()
    command.stamp(alembic_config, revision)

    return StampRevisionResponse(error_codes=[])
