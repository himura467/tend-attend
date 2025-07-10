from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio.session import AsyncSession

from app.core.dtos.verify import (
    RequestEmailVerificationRequest,
    RequestEmailVerificationResponse,
    VerifyEmailRequest,
    VerifyEmailResponse,
)
from app.core.infrastructure.sqlalchemy.db import get_db_async
from app.core.infrastructure.sqlalchemy.unit_of_work import SqlalchemyUnitOfWork
from app.core.usecase.verify import VerifyUsecase

router = APIRouter()


@router.post(
    path="/email/register",
    name="Request Email Verification",
    response_model=RequestEmailVerificationResponse,
)
async def request_email_verification(
    req: RequestEmailVerificationRequest,
    session: AsyncSession = Depends(get_db_async),
) -> RequestEmailVerificationResponse:
    email = req.email

    uow = SqlalchemyUnitOfWork(session=session)
    usecase = VerifyUsecase(uow=uow)

    return await usecase.request_email_verification_async(email=email)


@router.post(
    path="/email",
    name="Verify Email",
    response_model=VerifyEmailResponse,
)
async def verify_email(
    req: VerifyEmailRequest,
    session: AsyncSession = Depends(get_db_async),
) -> VerifyEmailResponse:
    email = req.email
    verification_token = req.verification_token

    uow = SqlalchemyUnitOfWork(session=session)
    usecase = VerifyUsecase(uow=uow)

    return await usecase.verify_email_async(email=email, verification_token=verification_token)
