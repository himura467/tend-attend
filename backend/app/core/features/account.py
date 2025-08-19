from dataclasses import dataclass
from enum import Enum, IntEnum

from app.core.utils.uuid import UUID


class Group(str, Enum):
    HOST = "HOST"
    GUEST = "GUEST"


class Role(IntEnum):
    HOST = 0
    GUEST = 1


groupRoleMap: dict[Group, set[Role]] = {
    Group.HOST: {Role.HOST, Role.GUEST},
    Group.GUEST: {Role.GUEST},
}


class Gender(str, Enum):
    MALE = "MALE"
    FEMALE = "FEMALE"


@dataclass(frozen=True)
class Account:
    account_id: UUID
    group: Group
    disabled: bool
