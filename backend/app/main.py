from typing import Awaitable, Callable

from fastapi import FastAPI, Request, Response, status
from mangum import Mangum
from starlette.middleware.base import BaseHTTPMiddleware
from app.api.main import api_router

app = FastAPI()


class CORSMiddleware(BaseHTTPMiddleware):
    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        if request.method == "OPTIONS":
            response = Response(status_code=status.HTTP_204_NO_CONTENT)
            response.headers["Access-Control-Allow-Headers"] = (
                "content-type, x-amz-content-sha256"
            )
            return response
        return await call_next(request)


app.add_middleware(CORSMiddleware)

app.include_router(api_router)

lambda_handler = Mangum(app)
