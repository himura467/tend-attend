from fastapi import APIRouter, Response, status

router = APIRouter()


@router.get("/healthz")
async def health_check() -> Response:
    return Response(status_code=status.HTTP_204_NO_CONTENT)
