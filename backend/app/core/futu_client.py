import asyncio
import hashlib
import logging
from concurrent.futures import ThreadPoolExecutor
from enum import Enum
from typing import Optional

from app.config import settings
from app.core.exceptions import NotConnectedError, TradeNotUnlockedError

logger = logging.getLogger(__name__)


class ConnectionState(str, Enum):
    DISCONNECTED = "disconnected"
    CONNECTING = "connecting"
    CONNECTED = "connected"
    TRADE_UNLOCKED = "trade_unlocked"
    ERROR = "error"
    RECONNECTING = "reconnecting"


class FutuClient:
    """Singleton that manages the FutuOpenD connection lifecycle."""

    _instance: Optional["FutuClient"] = None
    _executor = ThreadPoolExecutor(max_workers=4)

    def __new__(cls) -> "FutuClient":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self._initialized = True
        self._quote_ctx = None
        self._trade_ctx_hk = None
        self._trade_ctx_us = None
        self._trade_ctx_cn = None
        self._state = ConnectionState.DISCONNECTED
        self._host: str = settings.futu_host
        self._port: int = settings.futu_port
        self._reconnect_task: Optional[asyncio.Task] = None
        self._health_task: Optional[asyncio.Task] = None

    @property
    def state(self) -> ConnectionState:
        return self._state

    @property
    def trade_unlocked(self) -> bool:
        return self._state == ConnectionState.TRADE_UNLOCKED

    def _set_state(self, state: ConnectionState):
        self._state = state
        logger.info(f"FutuClient state -> {state.value}")

    async def connect(self, host: str = None, port: int = None) -> None:
        """Establish connections to FutuOpenD."""
        if host:
            self._host = host
        if port:
            self._port = port

        self._set_state(ConnectionState.CONNECTING)

        try:
            from futu import OpenQuoteContext, OpenSecTradeContext, TrdEnv, TrdMarket

            # Open quote context
            self._quote_ctx = await self._run_sync(
                OpenQuoteContext, host=self._host, port=self._port
            )
            # Open trade contexts per market
            self._trade_ctx_hk = await self._run_sync(
                OpenSecTradeContext,
                host=self._host,
                port=self._port,
                filter_trdmarket=TrdMarket.HK,
            )
            self._trade_ctx_us = await self._run_sync(
                OpenSecTradeContext,
                host=self._host,
                port=self._port,
                filter_trdmarket=TrdMarket.US,
            )
            self._trade_ctx_cn = await self._run_sync(
                OpenSecTradeContext,
                host=self._host,
                port=self._port,
                filter_trdmarket=TrdMarket.CN,
            )

            # Health check
            await self._health_check_internal()
            self._set_state(ConnectionState.CONNECTED)
            self._start_health_monitor()

        except Exception as e:
            self._set_state(ConnectionState.ERROR)
            self._cleanup_contexts()
            raise

    async def disconnect(self) -> None:
        """Gracefully disconnect from FutuOpenD."""
        self._stop_health_monitor()
        self._cleanup_contexts()
        self._set_state(ConnectionState.DISCONNECTED)

    async def unlock_trade(self, password: str) -> None:
        """Unlock trade for position/order access.

        Tries API unlock first (works for CLI version). If the GUI version
        blocks it, falls back to verifying trade access via position query.
        """
        if self._state not in (ConnectionState.CONNECTED, ConnectionState.TRADE_UNLOCKED):
            raise NotConnectedError()

        api_blocked = False
        password_md5 = hashlib.md5(password.encode()).hexdigest()

        for ctx in [self._trade_ctx_hk, self._trade_ctx_us, self._trade_ctx_cn]:
            if ctx:
                # Try plain password first, then MD5
                ret, data = await self._run_sync(
                    ctx.unlock_trade, password=password
                )
                if ret != 0:
                    ret, data = await self._run_sync(
                        ctx.unlock_trade, password_md5=password_md5
                    )
                if ret != 0:
                    err_msg = str(data)
                    logger.warning(f"Trade unlock API call failed: {err_msg}")
                    if "GUI version" in err_msg or "disabled" in err_msg.lower():
                        api_blocked = True
                        break
                    raise TradeNotUnlockedError(err_msg or "Incorrect password")

        if api_blocked:
            # GUI version blocks API unlock — verify trade access directly
            logger.info("API unlock blocked by GUI, verifying trade access directly...")
            for ctx in [self._trade_ctx_hk, self._trade_ctx_us, self._trade_ctx_cn]:
                if ctx:
                    ret, _ = await self._run_sync(ctx.position_list_query)
                    if ret == 0:
                        logger.info("Trade access verified via position query")
                        break
            else:
                raise TradeNotUnlockedError(
                    "Trade not unlocked. Please click Unlock in the FutuOpenD window first."
                )

        self._set_state(ConnectionState.TRADE_UNLOCKED)

    def get_quote_ctx(self):
        if self._quote_ctx is None:
            raise NotConnectedError()
        return self._quote_ctx

    def get_trade_ctx(self, market: str):
        if self._state != ConnectionState.TRADE_UNLOCKED:
            raise TradeNotUnlockedError()
        ctx_map = {"HK": self._trade_ctx_hk, "US": self._trade_ctx_us, "CN": self._trade_ctx_cn}
        ctx = ctx_map.get(market.upper())
        if ctx is None:
            raise NotConnectedError()
        return ctx

    async def _run_sync(self, func, *args, **kwargs):
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(self._executor, lambda: func(*args, **kwargs))

    async def _health_check_internal(self) -> bool:
        """Ping FutuOpenD to verify connection is alive."""
        if self._quote_ctx is None:
            return False
        try:
            ret, _ = await self._run_sync(self._quote_ctx.get_global_state)
            return ret == 0
        except Exception:
            return False

    def _start_health_monitor(self):
        if self._health_task is None or self._health_task.done():
            self._health_task = asyncio.create_task(self._health_monitor_loop())

    def _stop_health_monitor(self):
        if self._health_task and not self._health_task.done():
            self._health_task.cancel()

    async def _health_monitor_loop(self):
        """Background task: check health every 30s, reconnect with backoff."""
        backoff = 1
        while True:
            await asyncio.sleep(30)
            healthy = await self._health_check_internal()
            if not healthy and self._state not in (
                ConnectionState.DISCONNECTED,
                ConnectionState.RECONNECTING,
            ):
                self._set_state(ConnectionState.RECONNECTING)
                while not healthy:
                    logger.warning(
                        f"FutuOpenD unhealthy, reconnecting in {backoff}s..."
                    )
                    await asyncio.sleep(backoff)
                    backoff = min(backoff * 2, 30)
                    try:
                        await self.connect()
                        healthy = True
                        backoff = 1
                    except Exception:
                        pass
            elif healthy and self._state == ConnectionState.RECONNECTING:
                self._set_state(ConnectionState.CONNECTED)
                backoff = 1

    def _cleanup_contexts(self):
        for ctx in [
            self._quote_ctx,
            self._trade_ctx_hk,
            self._trade_ctx_us,
            self._trade_ctx_cn,
        ]:
            if ctx:
                try:
                    ctx.close()
                except Exception:
                    pass
        self._quote_ctx = None
        self._trade_ctx_hk = None
        self._trade_ctx_us = None
        self._trade_ctx_cn = None

    def __del__(self):
        self._cleanup_contexts()


futu_client = FutuClient()
