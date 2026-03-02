import httpx
import asyncio
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from app.database import SessionLocal
from app import models

# Simple in-memory cache for IP geolocation to avoid excessive API calls
_geo_cache: dict = {}


async def get_geo_info(ip: str) -> dict:
    """Resolve IP to city/country using free ip-api.com"""
    if ip in _geo_cache:
        return _geo_cache[ip]

    # Skip localhost / private IPs
    if ip in ("127.0.0.1", "0.0.0.0", "localhost", "::1") or ip.startswith("192.168.") or ip.startswith("10."):
        result = {"country": "Local", "city": "Localhost"}
        _geo_cache[ip] = result
        return result

    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(f"http://ip-api.com/json/{ip}?fields=country,city,status")
            data = resp.json()
            if data.get("status") == "success":
                result = {
                    "country": data.get("country", "Desconocido"),
                    "city": data.get("city", "Desconocido")
                }
            else:
                result = {"country": "Desconocido", "city": "Desconocido"}
    except Exception:
        result = {"country": "Desconocido", "city": "Desconocido"}

    _geo_cache[ip] = result
    return result


class AnalyticsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        # Only track page navigations (not API calls or static files)
        path = request.url.path
        skip_prefixes = ("/api/", "/static/", "/ws/", "/docs", "/openapi", "/favicon")
        if any(path.startswith(p) for p in skip_prefixes):
            return response

        # Get client IP
        forwarded = request.headers.get("x-forwarded-for")
        ip = forwarded.split(",")[0].strip() if forwarded else (request.client.host if request.client else "0.0.0.0")

        user_agent = request.headers.get("user-agent", "")

        # Run geolocation + DB insert in background to not slow down response
        asyncio.create_task(self._log_visit(ip, path, user_agent))

        return response

    async def _log_visit(self, ip: str, path: str, user_agent: str):
        try:
            geo = await get_geo_info(ip)
            db = SessionLocal()
            try:
                visit = models.PageVisit(
                    ip_address=ip,
                    country=geo["country"],
                    city=geo["city"],
                    path=path,
                    user_agent=user_agent
                )
                db.add(visit)
                db.commit()
            finally:
                db.close()
        except Exception:
            pass  # Silently fail - analytics should never break the app
