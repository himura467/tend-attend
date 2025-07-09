from abc import ABCMeta, abstractmethod
from typing import Any, Protocol, Type

from sqlalchemy.orm.base import Mapped

from core.domain.entities.base import IEntity
from core.utils.uuid import UUID


class ModelProtocol[TEntity: IEntity](Protocol):
    id: Mapped[bytes]

    def to_entity(self) -> TEntity: ...

    @classmethod
    def from_entity(
        cls: Type["ModelProtocol[TEntity]"], entity: TEntity
    ) -> "ModelProtocol[TEntity]": ...


class IRepository[TEntity: IEntity, TModel: ModelProtocol[Any]](metaclass=ABCMeta):
    @abstractmethod
    async def create_async(self, entity: TEntity) -> TEntity | None:
        raise NotImplementedError()

    @abstractmethod
    async def bulk_create_async(self, entities: set[TEntity]) -> set[TEntity] | None:
        raise NotImplementedError()

    @abstractmethod
    async def read_by_id_async(self, record_id: UUID) -> TEntity:
        raise NotImplementedError()

    @abstractmethod
    async def read_by_id_or_none_async(self, record_id: UUID) -> TEntity | None:
        raise NotImplementedError()

    @abstractmethod
    async def read_by_ids_async(self, record_ids: set[UUID]) -> set[TEntity]:
        raise NotImplementedError()

    @abstractmethod
    async def read_all_async(self, where: list[Any]) -> set[TEntity]:
        raise NotImplementedError()

    @abstractmethod
    async def update_async(self, entity: TEntity) -> TEntity:
        raise NotImplementedError()

    @abstractmethod
    async def delete_by_id_async(self, record_id: UUID) -> None:
        raise NotImplementedError()

    @abstractmethod
    async def delete_all_async(self, where: list[Any]) -> None:
        raise NotImplementedError()
