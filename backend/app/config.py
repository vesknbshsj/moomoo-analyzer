from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}

    futu_host: str = "127.0.0.1"
    futu_port: int = 11111
    default_markets: str = "HK,US,CN"
    fx_rate_provider: str = "frankfurter"
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    cache_ttl_portfolio: int = 30
    cache_ttl_snapshot: int = 5
    cache_ttl_kline: int = 300
    cache_ttl_roast: int = 300
    cache_ttl_fx: int = 3600
    cache_ttl_stock_info: int = 3600
    log_level: str = "INFO"


settings = Settings()
