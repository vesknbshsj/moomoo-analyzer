from fastapi import APIRouter, Depends, Query

from app.api.deps import get_trend_service
from app.models.trend import IndicatorSet, KlineData, SrLevelsResponse, StockInfo
from app.services.trend_service import TrendService

router = APIRouter()


@router.get("/trend/{code}/klines", response_model=KlineData)
async def get_klines(
    code: str,
    kl_type: str = Query("K_DAY"),
    count: int = Query(250),
    svc: TrendService = Depends(get_trend_service),
):
    return await svc.get_klines(code, kl_type, count)


@router.get("/trend/{code}/indicators", response_model=IndicatorSet)
async def get_indicators(
    code: str,
    kl_type: str = Query("K_DAY"),
    count: int = Query(250),
    svc: TrendService = Depends(get_trend_service),
):
    return await svc.get_indicators(code, kl_type, count)


@router.get("/trend/{code}/sr-levels", response_model=SrLevelsResponse)
async def get_sr_levels(
    code: str,
    kl_type: str = Query("K_DAY"),
    count: int = Query(250),
    svc: TrendService = Depends(get_trend_service),
):
    return await svc.get_sr_levels(code, kl_type, count)


@router.get("/trend/search", response_model=list[StockInfo])
async def search_stock(
    q: str = Query(..., min_length=1),
    svc: TrendService = Depends(get_trend_service),
):
    return await svc.search_stock(q)
