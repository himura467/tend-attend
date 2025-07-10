from dataclasses import dataclass

from app.core.domain.unit_of_work.base import IUnitOfWork


@dataclass(frozen=True)
class IUsecase:
    uow: IUnitOfWork
