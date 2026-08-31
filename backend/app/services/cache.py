from cachetools import TTLCache
from typing import Any, Optional

# AI Pricing cache: 10 minutes TTL
pricing_cache = TTLCache(maxsize=1000, ttl=600)

# Product query cache: 30 seconds TTL
product_list_cache = TTLCache(maxsize=200, ttl=30)

def get_cached_pricing(key: str) -> Optional[Any]:
    return pricing_cache.get(key)

def set_cached_pricing(key: str, value: Any) -> None:
    pricing_cache[key] = value

def get_cached_products(key: str) -> Optional[Any]:
    return product_list_cache.get(key)

def set_cached_products(key: str, value: Any) -> None:
    product_list_cache[key] = value

def clear_product_cache() -> None:
    product_list_cache.clear()
