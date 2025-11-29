from datetime import timedelta

from app.core.constants.secrets import JWT_SECRET_KEY
from app.core.cryptography.hash import PasswordHasher
from app.core.cryptography.jwt import JWTCryptography
from app.core.domain.usecase.base import IUsecase
from app.core.dtos.auth import AuthSessionResponse
from app.core.error.error_code import ErrorCode
from app.core.features.account import Account
from app.core.infrastructure.db.transaction import rollbackable
from app.core.infrastructure.sqlalchemy.repositories.account import (
    UserAccountRepository,
)


class AuthUsecase(IUsecase):
    assert JWT_SECRET_KEY is not None

    _ALGORITHM = "HS256"
    _SESSION_TOKEN_EXPIRES = timedelta(days=7)

    _password_hasher = PasswordHasher()
    _jwt_cryptography = JWTCryptography(
        secret_key=JWT_SECRET_KEY,
        algorithm=_ALGORITHM,
    )

    async def get_account_by_session_token(self, session_token: str) -> Account | None:
        user_account_repository = UserAccountRepository(self.uow)

        account_id = self._jwt_cryptography.get_subject_from_session_token(session_token)
        if account_id is None:
            return None

        user_account = await user_account_repository.read_by_id_or_none_async(account_id)
        if user_account is None:
            raise ValueError("User account not found")

        return Account(
            account_id=account_id,
            username=user_account.username,
            group=user_account.group,
            disabled=False,
        )

    @rollbackable
    async def auth_user_async(self, username: str, password: str) -> AuthSessionResponse:
        user_account_repository = UserAccountRepository(self.uow)

        user_account = await user_account_repository.read_by_username_or_none_async(username)
        if user_account is None:
            return AuthSessionResponse(
                error_codes=[ErrorCode.USERNAME_NOT_EXIST],
                session_token=None,
                max_age=0,
            )

        if not self._password_hasher.verify_password(password, user_account.hashed_password):
            return AuthSessionResponse(
                error_codes=[ErrorCode.PASSWORD_INCORRECT],
                session_token=None,
                max_age=0,
            )

        session_token = self._jwt_cryptography.create_session_token(user_account.id, self._SESSION_TOKEN_EXPIRES)

        return AuthSessionResponse(
            error_codes=[],
            session_token=session_token,
            max_age=int(self._SESSION_TOKEN_EXPIRES.total_seconds()),
        )
