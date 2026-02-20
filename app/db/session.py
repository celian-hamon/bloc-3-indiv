import time

from prometheus_client import Histogram
from sqlalchemy import event
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import settings

engine = create_async_engine(settings.database_url, echo=True)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

DB_QUERY_DURATION = Histogram("db_query_duration_seconds", "Time spent executing database queries")


@event.listens_for(engine.sync_engine, "before_cursor_execute")
def before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    conn.info.setdefault("query_start_time", []).append(time.perf_counter())


@event.listens_for(engine.sync_engine, "after_cursor_execute")
def after_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    start_time = conn.info["query_start_time"].pop(-1)
    duration = time.perf_counter() - start_time
    DB_QUERY_DURATION.observe(duration)


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
