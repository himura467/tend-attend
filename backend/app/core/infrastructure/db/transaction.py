from functools import wraps
from typing import Any, Awaitable, Callable

from app.core.domain.usecase.base import IUsecase
from app.core.dtos.base import BaseModelWithErrorCodes


def rollbackable[T: BaseModelWithErrorCodes](f: Callable[..., Awaitable[T]]) -> Callable[..., Awaitable[T]]:
    @wraps(f)
    async def wrapper(self: IUsecase, *args: Any, **kwargs: Any) -> T:
        response: T = await f(self, *args, **kwargs)
        if response.error_codes:
            await self.uow.rollback_async()
        else:
            await self.uow.commit_async()
        return response

    return wrapper
