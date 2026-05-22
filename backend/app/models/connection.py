from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ConnectionConfig(BaseModel):
    host: str = "127.0.0.1"
    port: int = 11111


class ConnectionStatus(BaseModel):
    state: str  # disconnected, connecting, connected, trade_unlocked, error, reconnecting
    message: Optional[str] = None
    trade_unlocked: bool = False
