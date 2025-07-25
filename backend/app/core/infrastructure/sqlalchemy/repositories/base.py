from abc import abstractmethod
from typing import Any

from sqlalchemy.exc import IntegrityError
from sqlalchemy.sql import delete, select, update
from sqlalchemy.sql.elements import UnaryExpression

from app.core.domain.entities.base import IEntity
from app.core.domain.repositories.base import IRepository, ModelProtocol
from app.core.domain.unit_of_work.base import IUnitOfWork
from app.core.utils.uuid import UUID, uuid_to_bin


class AbstractRepository[TEntity: IEntity, TModel: ModelProtocol[Any]](IRepository[TEntity, TModel]):
    def __init__(self, uow: IUnitOfWork) -> None:
        self._uow = uow

    @property
    @abstractmethod
    def _model(self) -> type[TModel]:
        raise NotImplementedError()

    async def create_async(self, entity: TEntity) -> TEntity | None:
        model = self._model.from_entity(entity)
        async with self._uow.begin_nested() as savepoint:
            try:
                self._uow.add(model)
                await self._uow.flush_async()
                return entity
            except IntegrityError:
                await savepoint.rollback()
                return None

    async def bulk_create_async(self, entities: set[TEntity]) -> set[TEntity] | None:
        models = [self._model.from_entity(entity) for entity in entities]
        async with self._uow.begin_nested() as savepoint:
            try:
                self._uow.add_all(models)
                await self._uow.flush_async()
                return entities
            except IntegrityError:
                await savepoint.rollback()
                return None

    async def read_by_id_async(self, record_id: UUID) -> TEntity:
        stmt = select(self._model).where(self._model.id == uuid_to_bin(record_id))
        result = await self._uow.execute_async(stmt)
        entity: TEntity = result.scalar_one().to_entity()
        return entity

    async def read_by_id_or_none_async(self, record_id: UUID) -> TEntity | None:
        stmt = select(self._model).where(self._model.id == uuid_to_bin(record_id))
        result = await self._uow.execute_async(stmt)
        record = result.scalar_one_or_none()
        return record.to_entity() if record is not None else None

    async def read_by_ids_async(self, record_ids: set[UUID]) -> set[TEntity]:
        stmt = select(self._model).where(self._model.id.in_(uuid_to_bin(record_id) for record_id in record_ids))
        result = await self._uow.execute_async(stmt)
        return set(record.to_entity() for record in result.scalars().all())

    async def read_one_async(self, where: list[Any]) -> TEntity:
        stmt = select(self._model).where(*where)
        result = await self._uow.execute_async(stmt)
        entity: TEntity = result.scalar_one().to_entity()
        return entity

    async def read_one_or_none_async(self, where: list[Any]) -> TEntity | None:
        stmt = select(self._model).where(*where)
        result = await self._uow.execute_async(stmt)
        record = result.scalar_one_or_none()
        return record.to_entity() if record is not None else None

    async def read_all_async(self, where: list[Any]) -> set[TEntity]:
        stmt = select(self._model).where(*where)
        result = await self._uow.execute_async(stmt)
        return set(record.to_entity() for record in result.scalars().all())

    async def read_order_by_limit_async(
        self,
        where: list[Any],
        order_by: UnaryExpression[Any],
        limit: int,
    ) -> list[TEntity]:
        stmt = select(self._model).where(*where).order_by(order_by).limit(limit)
        result = await self._uow.execute_async(stmt)
        return [record.to_entity() for record in result.scalars().all()]

    async def update_async(self, entity: TEntity) -> TEntity:
        model = self._model.from_entity(entity)
        update_dict = {key: value for key, value in model.__dict__.items() if key != "id"}
        # Remove SQLAlchemy internal state
        if "_sa_instance_state" in update_dict:
            del update_dict["_sa_instance_state"]
        stmt = update(self._model).where(self._model.id == model.id).values(update_dict)
        await self._uow.execute_async(stmt)
        return entity

    async def delete_by_id_async(self, record_id: UUID) -> None:
        stmt = delete(self._model).where(self._model.id == uuid_to_bin(record_id))
        await self._uow.execute_async(stmt)

    async def delete_all_async(self, where: list[Any]) -> None:
        stmt = delete(self._model).where(*where)
        await self._uow.execute_async(stmt)
