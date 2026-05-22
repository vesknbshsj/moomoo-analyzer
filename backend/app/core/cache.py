import hashlib
import json
from functools import wraps
from typing import Callable

from cachetools import TTLCache


class TtlCache:
    def __init__(self):
        self._stores: dict[str, TTLCache] = {}

    def get_store(self, namespace: str, ttl: int, maxsize: int = 500) -> TTLCache:
        key = f"{namespace}:{ttl}"
        if key not in self._stores:
            self._stores[key] = TTLCache(maxsize=maxsize, ttl=ttl)
        return self._stores[key]

    def invalidate(self, namespace: str) -> None:
        for key in list(self._stores.keys()):
            if key.startswith(f"{namespace}:"):
                self._stores[key].clear()

    def clear_all(self) -> None:
        for store in self._stores.values():
            store.clear()


cache = TtlCache()


def cached(namespace: str, ttl: int):
    """Decorator for caching async function results with a TTL."""

    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            store = cache.get_store(namespace, ttl)
            key_parts = [func.__name__] + [str(a) for a in args] + [
                f"{k}={v}" for k, v in sorted(kwargs.items())
            ]
            cache_key = hashlib.md5(
                json.dumps(key_parts, default=str).encode()
            ).hexdigest()
            if cache_key in store:
                return store[cache_key]
            result = await func(*args, **kwargs)
            store[cache_key] = result
            return result

        return wrapper

    return decorator
