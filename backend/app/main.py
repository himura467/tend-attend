from typing import Awaitable, Callable

from fastapi import FastAPI, Request, Response, status
from mangum import Mangum
from starlette.middleware.base import BaseHTTPMiddleware

from app.api.main import api_router

app = FastAPI()


class CORSMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable[[Request], Awaitable[Response]]) -> Response:
        if request.method == "OPTIONS":
            response = Response(status_code=status.HTTP_204_NO_CONTENT)
            response.headers["Access-Control-Allow-Headers"] = "content-type, x-amz-content-sha256, x-basic-auth"
        else:
            response = await call_next(request)
        origin = request.headers.get("Origin", "")
        is_localhost = "localhost" in origin or "127.0.0.1" in origin
        if is_localhost:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Methods"] = "*"
            response.headers["Access-Control-Allow-Credentials"] = "true"
        return response


app.add_middleware(CORSMiddleware)

app.include_router(api_router)

lambda_handler = Mangum(app)
