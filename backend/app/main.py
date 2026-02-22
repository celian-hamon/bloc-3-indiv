import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

# Import models to ensure they are registered with Base.metadata
from app.api.v1.router import api_router
from app.core.config import settings
from app.db.session import Base, engine

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Retry DB connection up to 10 times (handles Docker startup ordering)
    for attempt in range(10):
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            logger.info("Database tables created successfully.")
            break
        except Exception as e:
            logger.warning(f"DB connection attempt {attempt + 1}/10 failed: {e}")
            if attempt < 9:
                await asyncio.sleep(2)
            else:
                raise
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://app.celianhamon.fr",
        "https://celianhamon.fr",
        "http://localhost:3000",
        "http://localhost:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Instrumentator().instrument(app).expose(app)

app.include_router(api_router, prefix=settings.API_V1_STR)
