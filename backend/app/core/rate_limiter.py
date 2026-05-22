import asyncio
import time
from functools import wraps
from typing import Callable


def rate_limited(max_calls: int, period: float):
    """Decorator that limits calls to max_calls per period (seconds)."""
    timestamps: list[float] = []

    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            now = time.time()
            while timestamps and timestamps[0] < now - period:
                timestamps.pop(0)
            if len(timestamps) >= max_calls:
                sleep_time = timestamps[0] + period - now + 0.1
                if sleep_time > 0:
                    await asyncio.sleep(sleep_time)
            timestamps.append(time.time())
            return await func(*args, **kwargs)

        return wrapper

    return decorator
