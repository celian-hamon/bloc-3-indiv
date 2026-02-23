import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.core.config import settings

async def alter_db():
    engine = create_async_engine(settings.database_url)
    async with engine.begin() as conn:
        try:
            await conn.execute(text("ALTER TABLE messages ADD COLUMN file_url TEXT;"))
            print("Row added")
        except Exception as e:
            print("error", e)

if __name__ == "__main__":
    asyncio.run(alter_db())
