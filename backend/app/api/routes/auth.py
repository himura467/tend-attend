from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio.session import AsyncSession

from app.core.constants.constants import (
    COOKIE_DOMAIN,
    SESSION_TOKEN_NAME,
)
from app.core.dtos.auth import (
    CreateAuthSessionResponse,
)
from app.core.infrastructure.sqlalchemy.db import get_db_async
from app.core.infrastructure.sqlalchemy.unit_of_work import SqlalchemyUnitOfWork
from app.core.usecase.auth import AuthUsecase

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
