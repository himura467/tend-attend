from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio.session import AsyncSession

from app.api.deps import get_current_account
from app.core.constants.constants import (
    COOKIE_DOMAIN,
    SESSION_TOKEN_NAME,
)
from app.core.dtos.auth import (
    CreateAuthSessionResponse,
    GetAuthStatusResponse,
    RevokeAuthSessionResponse,
)
from app.core.features.account import Account
from app.core.infrastructure.sqlalchemy.db import get_db_async
from app.core.infrastructure.sqlalchemy.unit_of_work import SqlalchemyUnitOfWork
from app.core.usecase.auth import AuthUsecase
from app.core.utils.uuid import uuid_to_str

router = APIRouter()


@router.post(
    path="/sessions/create",
    name="Create Auth Session",
    response_model=CreateAuthSessionResponse,
)
async def create_auth_session(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: AsyncSession = Depends(get_db_async),
) -> CreateAuthSessionResponse:
    username = form_data.username
    password = form_data.password

    uow = SqlalchemyUnitOfWork(session=session)
    usecase = AuthUsecase(uow=uow)

    res = await usecase.auth_user_async(username=username, password=password)
    if res.session_token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    response.set_cookie(
        key=SESSION_TOKEN_NAME,
        value=res.session_token,
        max_age=res.max_age,
        expires=datetime.now(timezone.utc) + timedelta(seconds=res.max_age),
        path="/",
        domain=COOKIE_DOMAIN,
        secure=True,
        httponly=True,
        samesite="strict",
    )

    return CreateAuthSessionResponse(error_codes=res.error_codes)


@router.delete(
    path="/sessions",
    name="Revoke Auth Session",
    response_model=RevokeAuthSessionResponse,
)
async def revoke_auth_session(
    response: Response,
) -> RevokeAuthSessionResponse:
    response.delete_cookie(
        key=SESSION_TOKEN_NAME,
        path="/",
        domain=COOKIE_DOMAIN,
        secure=True,
        httponly=True,
        samesite="strict",
    )

    return RevokeAuthSessionResponse(error_codes=[])


@router.get(
    path="/status",
    name="Get Auth Status",
    response_model=GetAuthStatusResponse,
)
async def get_auth_status(
    account: Account | None = Depends(get_current_account),
) -> GetAuthStatusResponse:
    if account is None or account.disabled:
        return GetAuthStatusResponse(error_codes=[], account_id=None, username=None, group=None)
    return GetAuthStatusResponse(
        error_codes=[],
        account_id=uuid_to_str(account.account_id),
        username=account.username,
        group=account.group.value,
    )
