from dataclasses import dataclass

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio.session import AsyncSession
from app.core.features.account import Account, Role, groupRoleMap
from app.core.features.auth import TokenType
from app.core.infrastructure.sqlalchemy.db import get_db_async
from app.core.infrastructure.sqlalchemy.unit_of_work import SqlalchemyUnitOfWork
from app.core.usecase.auth import AuthUsecase
from app.core.constants.constants import ACCESS_TOKEN_NAME


class OAuth2Cookie(OAuth2PasswordBearer):
    async def __call__(self, request: Request) -> str | None:
        access_token = request.cookies.get(ACCESS_TOKEN_NAME)
        if not access_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="No access token found",
            )
        return access_token


cookie_scheme = OAuth2Cookie(tokenUrl="auth/tokens/create")


@dataclass(frozen=True, eq=True)
class AccessControl:
    permit: set[Role]

    async def __call__(
        self,
        token: str = Depends(cookie_scheme),
        session: AsyncSession = Depends(get_db_async),
    ) -> Account:
        uow = SqlalchemyUnitOfWork(session=session)
        usecase = AuthUsecase(uow=uow)

        account = await usecase.get_account_by_token(token, TokenType.ACCESS)
        if account is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
            )
        if account.disabled:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive account"
            )
        if not self.has_compatible_role(account):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions"
            )

        return account

    def __hash__(self) -> int:
        return hash(",".join(sorted(map(str, self.permit))))

    def has_compatible_role(self, account: Account) -> bool:
        roles = set(groupRoleMap[account.group])
        return len(self.permit.intersection(roles)) > 0
