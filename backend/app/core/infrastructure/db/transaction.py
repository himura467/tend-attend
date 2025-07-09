from functools import wraps
from typing import Awaitable, Callable, cast

from app.core.domain.usecase.base import IUsecase
from app.core.dtos.base import BaseModelWithErrorCodes


def rollbackable[**P, T: Awaitable[BaseModelWithErrorCodes]](
    f: Callable[P, T],
) -> Callable[P, T]:
    @wraps(f)
    async def wrapper(self: IUsecase, *args: P.args, **kwargs: P.kwargs) -> BaseModelWithErrorCodes:
        response: BaseModelWithErrorCodes = await f(self, *args, **kwargs)
        if response.error_codes:
            await self.uow.rollback_async()
        else:
            await self.uow.commit_async()
        return response

    return cast(Callable[P, T], wrapper)
