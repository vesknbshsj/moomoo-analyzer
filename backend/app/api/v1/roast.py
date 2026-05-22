from fastapi import APIRouter, Depends

from app.api.deps import get_roast_service
from app.models.roast import RoastSummary
from app.services.roast_service import RoastService

router = APIRouter()


@router.get("/roast", response_model=RoastSummary)
async def get_roast(
    svc: RoastService = Depends(get_roast_service),
):
    return await svc.generate_roast()


@router.post("/roast/regenerate", response_model=RoastSummary)
async def regenerate_roast(
    svc: RoastService = Depends(get_roast_service),
):
    return await svc.regenerate_roast()
