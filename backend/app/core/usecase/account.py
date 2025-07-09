from datetime import datetime

from pydantic.networks import EmailStr

from app.core.cryptography.hash import PasswordHasher
from app.core.domain.usecase.base import IUsecase
from app.core.dtos.account import CreateUserAccountResponse, GetFollowersInfoResponse
from app.core.dtos.account import FollowerInfo as FollowerInfoDto
from app.core.error.error_code import ErrorCode
from app.core.features.account import Gender
from app.core.infrastructure.db.transaction import rollbackable
from app.core.infrastructure.sqlalchemy.models.sequences.sequence import SequenceUserId
from app.core.infrastructure.sqlalchemy.repositories.account import (
    UserAccountRepository,
)
from app.core.utils.uuid import UUID, generate_uuid, uuid_to_str


class AccountUsecase(IUsecase):
    _password_hasher = PasswordHasher()

    @rollbackable
    async def create_user_account_async(
        self,
        username: str,
        password: str,
        nickname: str | None,
        birth_date: datetime,
        gender: Gender,
        email: EmailStr,
        followee_usernames: set[str],
    ) -> CreateUserAccountResponse:
        user_account_repository = UserAccountRepository(self.uow)

        user_id = await SequenceUserId.id_generator(self.uow)

        followees = await user_account_repository.read_by_usernames_async(followee_usernames)

        user_account_id = generate_uuid()
        user_account = await user_account_repository.create_user_account_async(
            entity_id=user_account_id,
            user_id=user_id,
            username=username,
            hashed_password=self._password_hasher.get_password_hash(password),
            birth_date=birth_date,
            gender=gender,
            email=email,
            followee_ids={followee.id for followee in followees},
            follower_ids=set(),
            nickname=nickname,
        )
        if user_account is None:
            return CreateUserAccountResponse(
                error_codes=[ErrorCode.USERNAME_OR_EMAIL_ALREADY_REGISTERED],
            )

        return CreateUserAccountResponse(error_codes=[])

    @rollbackable
    async def get_followers_info_async(self, followee_id: UUID) -> GetFollowersInfoResponse:
        user_account_repository = UserAccountRepository(self.uow)

        followee = await user_account_repository.read_with_followers_by_id_or_none_async(followee_id)
        if followee is None:
            raise ValueError("Followee ID not found")

        return GetFollowersInfoResponse(
            error_codes=[],
            followers=(
                [
                    FollowerInfoDto(
                        account_id=uuid_to_str(follower.id),
                        username=follower.username,
                        nickname=follower.nickname,
                    )
                    for follower in followee.followers
                ]
            ),
        )
