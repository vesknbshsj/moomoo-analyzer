from fastapi import APIRouter

from app.api.v1.connection import router as connection_router
from app.api.v1.portfolio import router as portfolio_router
from app.api.v1.roast import router as roast_router
from app.api.v1.fx_pl import router as fx_pl_router
from app.api.v1.trend import router as trend_router

router = APIRouter(prefix="/api/v1")
router.include_router(connection_router, tags=["Connection"])
router.include_router(portfolio_router, tags=["Portfolio"])
router.include_router(roast_router, tags=["Roast"])
router.include_router(fx_pl_router, tags=["FX P&L"])
router.include_router(trend_router, tags=["Trend"])
