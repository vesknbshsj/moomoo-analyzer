import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import router as v1_router
from app.config import settings
from app.core.exceptions import AppBaseError
from app.core.futu_client import futu_client

logging.basicConfig(
    level=getattr(logging, settings.log_level.upper(), logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Moomoo Analyzer backend starting...")
    yield
    logger.info("Shutting down...")
    await futu_client.disconnect()


app = FastAPI(
    title="Moomoo Stock Analyzer",
    description="Portfolio Roast, FX P&L Decoupling, and Stock Trend Analysis for moomoo users",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(v1_router)


@app.exception_handler(AppBaseError)
async def app_exception_handler(request: Request, exc: AppBaseError):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": True, "code": exc.code, "detail": exc.detail},
    )


@app.get("/health")
async def health():
    return {"status": "ok"}
