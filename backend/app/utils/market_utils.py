from typing import Optional


MARKET_NAMES = {
    "HK": "港股",
    "US": "美股",
    "CN": "A股",
    "SG": "新加坡",
    "JP": "日本",
}

MARKET_CURRENCIES = {
    "HK": "HKD",
    "US": "USD",
    "CN": "CNH",
    "SG": "SGD",
    "JP": "JPY",
}


def parse_stock_code(code: str) -> tuple[str, str]:
    """Parse 'US.AAPL' -> ('US', 'AAPL')."""
    parts = code.split(".", 1)
    if len(parts) == 2:
        return parts[0].upper(), parts[1]
    return "UNKNOWN", code


def get_market_name(market: str) -> str:
    return MARKET_NAMES.get(market.upper(), market)


def get_market_currency(market: str) -> str:
    return MARKET_CURRENCIES.get(market.upper(), "USD")


def get_default_markets() -> list[str]:
    from app.config import settings

    return [m.strip() for m in settings.default_markets.split(",") if m.strip()]
