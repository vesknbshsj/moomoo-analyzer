from fastapi import APIRouter, Depends, Query

from app.api.deps import get_fx_pl_service
from app.models.fx_pl import CurrencyExposure, FxPlSummary
from app.services.fx_pl_service import FxPlService

router = APIRouter()


@router.get("/fx-pl/summary", response_model=FxPlSummary)
async def get_fx_pl_summary(
    base_currency: str = Query("CNH", description="Account base currency"),
    svc: FxPlService = Depends(get_fx_pl_service),
):
    return await svc.get_summary(base_currency)


@router.get("/fx-pl/exposure", response_model=list[CurrencyExposure])
async def get_currency_exposure(
    base_currency: str = Query("CNH"),
    svc: FxPlService = Depends(get_fx_pl_service),
):
    return await svc.get_currency_exposure(base_currency)
