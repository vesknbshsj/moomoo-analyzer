from fastapi import APIRouter, Depends

from app.api.deps import get_connection_service
from app.models.connection import ConnectionConfig, ConnectionStatus
from app.services.connection_service import ConnectionService

router = APIRouter()


@router.post("/connect", response_model=ConnectionStatus)
async def connect(
    config: ConnectionConfig,
    svc: ConnectionService = Depends(get_connection_service),
):
    return await svc.connect(config)


@router.delete("/connect", response_model=ConnectionStatus)
async def disconnect(
    svc: ConnectionService = Depends(get_connection_service),
):
    return await svc.disconnect()


@router.get("/connect/status", response_model=ConnectionStatus)
async def connection_status(
    svc: ConnectionService = Depends(get_connection_service),
):
    return svc.get_status()


from pydantic import BaseModel

class TradeUnlockRequest(BaseModel):
    password: str


@router.post("/connect/trade-unlock", response_model=ConnectionStatus)
async def unlock_trade(
    body: TradeUnlockRequest,
    svc: ConnectionService = Depends(get_connection_service),
):
    return await svc.unlock_trade(body.password)
