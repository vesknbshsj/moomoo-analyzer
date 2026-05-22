from app.services.connection_service import ConnectionService
from app.services.portfolio_service import PortfolioService
from app.services.roast_service import RoastService
from app.services.fx_pl_service import FxPlService
from app.services.trend_service import TrendService

_connection_service = ConnectionService()
_portfolio_service = PortfolioService()
_roast_service = RoastService()
_fx_pl_service = FxPlService()
_trend_service = TrendService()


def get_connection_service() -> ConnectionService:
    return _connection_service


def get_portfolio_service() -> PortfolioService:
    return _portfolio_service


def get_roast_service() -> RoastService:
    return _roast_service


def get_fx_pl_service() -> FxPlService:
    return _fx_pl_service


def get_trend_service() -> TrendService:
    return _trend_service
