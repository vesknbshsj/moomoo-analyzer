from app.core.futu_client import ConnectionState, futu_client
from app.models.connection import ConnectionConfig, ConnectionStatus


class ConnectionService:
    async def connect(self, config: ConnectionConfig) -> ConnectionStatus:
        await futu_client.connect(host=config.host, port=config.port)
        return self.get_status()

    async def disconnect(self) -> ConnectionStatus:
        await futu_client.disconnect()
        return self.get_status()

    async def unlock_trade(self, password: str) -> ConnectionStatus:
        await futu_client.unlock_trade(password)
        return self.get_status()

    def get_status(self) -> ConnectionStatus:
        return ConnectionStatus(
            state=futu_client.state.value,
            trade_unlocked=futu_client.trade_unlocked,
            message=self._state_message(futu_client.state),
        )

    def _state_message(self, state: ConnectionState) -> str:
        messages = {
            ConnectionState.DISCONNECTED: "未连接 / Not connected",
            ConnectionState.CONNECTING: "正在连接... / Connecting...",
            ConnectionState.CONNECTED: "已连接行情 / Quotes connected",
            ConnectionState.TRADE_UNLOCKED: "已连接并可交易 / Connected & trade unlocked",
            ConnectionState.ERROR: "连接错误 / Connection error",
            ConnectionState.RECONNECTING: "重新连接中... / Reconnecting...",
        }
        return messages.get(state, "")
