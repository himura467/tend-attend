from dataclasses import dataclass
from typing import Any, Iterable, Optional, Tuple, Union

from sqlalchemy.orm.mapper import Mapper
from sqlalchemy.orm.session import ORMExecuteState
from sqlalchemy.orm.state import InstanceState
from sqlalchemy.sql.elements import ClauseElement

from app.core.constants.constants import DB_SHARD_COUNT
from app.core.infrastructure.db.settings import (
    COMMON_DB_CONNECTION_KEY,
    CONNECTIONS,
    SEQUENCE_DB_CONNECTION_KEY,
    SHARD_DB_CONNECTION_KEYS,
)


def shard_chooser[T](
    mapper: Optional[Mapper[T]], instance: Any, clause: Optional[ClauseElement] = None
) -> Any:
    shard_ids: set[str] = mapper.local_table.info.get("shard_ids") if mapper else set()  # type: ignore[attr-defined]
    if shard_ids == {COMMON_DB_CONNECTION_KEY}:
        return COMMON_DB_CONNECTION_KEY
    if shard_ids == set(SHARD_DB_CONNECTION_KEYS):
        shard_id = db_shard_resolver.resolve_shard_id(int(instance.user_id))
        return SHARD_DB_CONNECTION_KEYS[shard_id]
    if shard_ids == {SEQUENCE_DB_CONNECTION_KEY}:
        return SEQUENCE_DB_CONNECTION_KEY
    raise NotImplementedError()


def identity_chooser[T](
    mapper: Mapper[T],
    primary_key: Union[Any, Tuple[Any, ...]],
    *,
    lazy_loaded_from: Optional[InstanceState[Any]],
    **kw: Any,
) -> Any:
    if lazy_loaded_from:
        return [lazy_loaded_from.identity_token]
    else:
        return list(CONNECTIONS.keys())


def execute_chooser(context: ORMExecuteState) -> Iterable[Any]:
    shard_ids = set()
    for table in context.bind_mapper.tables:  # type: ignore[union-attr]
        ids = table.info.get("shard_ids")  # type: ignore[union-attr]
        if ids is not None:
            shard_ids.update(ids)
    if len(shard_ids) == 0:
        return list(CONNECTIONS.keys())
    else:
        return list(shard_ids)


@dataclass(frozen=True)
class DbShardResolver:
    shard_count: int

    def resolve_shard_id(self, user_id: int) -> int:
        return user_id % self.shard_count


db_shard_resolver = DbShardResolver(shard_count=DB_SHARD_COUNT)
