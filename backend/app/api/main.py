from fastapi import APIRouter

from app.api.routes import account, auth, event, verify

api_router = APIRouter()

api_router.include_router(
    account.router,
    prefix="/accounts",
    tags=["accounts"],
)

api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["auth"],
)

api_router.include_router(
    event.router,
    prefix="/events",
    tags=["events"],
)

api_router.include_router(
    verify.router,
    prefix="/verify",
    tags=["verify"],
)
