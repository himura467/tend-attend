from datetime import timedelta

from app.core.constants.secrets import JWT_SECRET_KEY
from app.core.cryptography.hash import PasswordHasher
from app.core.cryptography.jwt import JWTCryptography
from app.core.domain.usecase.base import IUsecase
from app.core.dtos.auth import AuthTokenResponse
from app.core.error.error_code import ErrorCode
from app.core.features.account import Account, Group
from app.core.features.auth import TokenType
from app.core.infrastructure.db.transaction import rollbackable
from app.core.infrastructure.sqlalchemy.repositories.account import (
    UserAccountRepository,
)


class AuthUsecase(IUsecase):
    assert JWT_SECRET_KEY is not None

    _ALGORITHM = "HS256"
    _ACCESS_TOKEN_EXPIRES = timedelta(minutes=60)
    _REFRESH_TOKEN_EXPIRES = timedelta(days=30)

    _password_hasher = PasswordHasher()
    _jwt_cryptography = JWTCryptography(
        secret_key=JWT_SECRET_KEY,
        algorithm=_ALGORITHM,
        access_token_expires=_ACCESS_TOKEN_EXPIRES,
        refresh_token_expires=_REFRESH_TOKEN_EXPIRES,
    )

    async def get_account_by_token(self, token: str, token_type: TokenType) -> Account | None:
        user_account_repository = UserAccountRepository(self.uow)

        token_info = self._jwt_cryptography.get_subject_and_group_from_token(token, token_type)
        if token_info is None:
            return None
        account_id, group = token_info

        user_account = await user_account_repository.read_by_id_or_none_async(account_id)
        if user_account is None:
            raise ValueError("User account not found")

        return Account(
            account_id=account_id,
            group=group,
            disabled=False,
        )

    @rollbackable
    async def auth_user_async(self, username: str, password: str) -> AuthTokenResponse:
        user_account_repository = UserAccountRepository(self.uow)

        user_account = await user_account_repository.read_by_username_or_none_async(username)
        if user_account is None:
            return AuthTokenResponse(
                error_codes=[ErrorCode.USERNAME_NOT_EXIST],
                auth_token=None,
                access_token_max_age=0,
                refresh_token_max_age=0,
            )

        if not self._password_hasher.verify_password(password, user_account.hashed_password):
            return AuthTokenResponse(
                error_codes=[ErrorCode.PASSWORD_INCORRECT],
                auth_token=None,
                access_token_max_age=0,
                refresh_token_max_age=0,
            )

        token = self._jwt_cryptography.create_auth_token(user_account.id, Group.HOST)
        user_account = user_account.set_refresh_token(token.refresh_token)
        await user_account_repository.update_async(user_account)

        return AuthTokenResponse(
            error_codes=[],
            auth_token=token,
            access_token_max_age=int(self._ACCESS_TOKEN_EXPIRES.total_seconds()),
            refresh_token_max_age=int(self._REFRESH_TOKEN_EXPIRES.total_seconds()),
        )

    @rollbackable
    async def refresh_auth_token_async(self, refresh_token: str) -> AuthTokenResponse:
        user_account_repository = UserAccountRepository(self.uow)

        account = await self.get_account_by_token(refresh_token, TokenType.REFRESH)
        if account is None:
            return AuthTokenResponse(
                error_codes=[ErrorCode.REFRESH_TOKEN_INVALID],
                auth_token=None,
                access_token_max_age=0,
                refresh_token_max_age=0,
            )

        user_account = await user_account_repository.read_by_id_async(account.account_id)

        token = self._jwt_cryptography.create_auth_token(user_account.id, Group.HOST)
        user_account = user_account.set_refresh_token(token.refresh_token)
        await user_account_repository.update_async(user_account)

        return AuthTokenResponse(
            error_codes=[],
            auth_token=token,
            access_token_max_age=int(self._ACCESS_TOKEN_EXPIRES.total_seconds()),
            refresh_token_max_age=int(self._REFRESH_TOKEN_EXPIRES.total_seconds()),
        )
