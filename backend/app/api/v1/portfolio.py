from fastapi import APIRouter, Depends

from app.api.deps import get_portfolio_service
from app.models.portfolio import PortfolioSummary, Position, SectorBreakdown
from app.services.portfolio_service import PortfolioService

router = APIRouter()


@router.get("/portfolio", response_model=list[Position])
async def get_positions(
    svc: PortfolioService = Depends(get_portfolio_service),
):
    return await svc.get_positions()


@router.get("/portfolio/summary", response_model=PortfolioSummary)
async def get_summary(
    svc: PortfolioService = Depends(get_portfolio_service),
):
    return await svc.get_summary()


@router.get("/portfolio/sectors", response_model=list[SectorBreakdown])
async def get_sector_breakdown(
    svc: PortfolioService = Depends(get_portfolio_service),
):
    return await svc.get_sector_breakdown()


@router.get("/portfolio/{code}", response_model=Position)
async def get_position(
    code: str,
    svc: PortfolioService = Depends(get_portfolio_service),
):
    return await svc.get_position(code)
