from datetime import datetime

from pydantic.networks import EmailStr

from app.core.domain.entities.base import IEntity
from app.core.features.account import Gender
from app.core.utils.uuid import UUID


class UserAccount(IEntity):
    def __init__(
        self,
        entity_id: UUID,
        user_id: int,
        username: str,
        hashed_password: str,
        nickname: str | None,
        birth_date: datetime,
        gender: Gender,
        email: EmailStr,
        email_verified: bool,
        followee_ids: set[UUID],
        followees: list["UserAccount"],
        follower_ids: set[UUID],
        followers: list["UserAccount"],
    ) -> None:
        super().__init__(entity_id)
        self.user_id = user_id
        self.username = username
        self.hashed_password = hashed_password
        self.nickname = nickname
        self.birth_date = birth_date
        self.gender = gender
        self.email = email
        self.email_verified = email_verified
        self.followee_ids = followee_ids
        self.followees = followees
        self.follower_ids = follower_ids
        self.followers = followers
