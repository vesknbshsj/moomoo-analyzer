class AppBaseError(Exception):
    status_code: int = 500
    code: str = "INTERNAL_ERROR"
    detail: str = "Internal server error"


class NotConnectedError(AppBaseError):
    status_code = 503
    code = "NOT_CONNECTED"
    detail = "Not connected to FutuOpenD. Please connect first."


class TradeNotUnlockedError(AppBaseError):
    status_code = 403
    code = "TRADE_NOT_UNLOCKED"

    def __init__(self, detail: str = "Trade not unlocked. Please enter your trade password."):
        self.detail = detail


class FutuOpenDError(AppBaseError):
    status_code = 502
    code = "FUTU_OPEND_ERROR"

    def __init__(self, ret_code: int, message: str):
        self.status_code = 502
        self.detail = f"FutuOpenD error (code={ret_code}): {message}"


class RateLimitError(AppBaseError):
    status_code = 429
    code = "RATE_LIMITED"
    detail = "Too many requests to FutuOpenD. Please wait."


class InvalidStockCodeError(AppBaseError):
    status_code = 404
    code = "INVALID_STOCK_CODE"
    detail = "Invalid or unknown stock code."


class ExternalApiError(AppBaseError):
    status_code = 502
    code = "EXTERNAL_API_ERROR"
    detail = "External API unavailable."
