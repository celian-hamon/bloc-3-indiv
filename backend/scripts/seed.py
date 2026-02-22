import asyncio
import os
import sys

# Add the backend directory to the sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.security import get_password_hash
from app.db.session import AsyncSessionLocal, Base, engine
from app.models.category import Category
from app.models.item import Article
from app.models.user import User
from sqlalchemy.future import select


async def seed():
    # Make sure tables exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # Check if users exist to avoid double seeding
        result = await session.execute(select(User).limit(1))
        if result.scalars().first():
            print("Database already seeded!")
            return

        print("Seeding database...")
        # Create user
        admin = User(
            email="admin@celianhamon.fr",
            full_name="Admin User",
            hashed_password=get_password_hash("password123"),
            role="admin",
        )
        session.add(admin)
        await session.commit()
        await session.refresh(admin)

        # Create categories
        electronics = Category(name="Electronics", description="Gadgets and devices")
        clothing = Category(name="Clothing", description="Apparel and accessories")
        home = Category(name="Home", description="Furniture and decor")

        session.add_all([electronics, clothing, home])
        await session.commit()

        # Refresh to get IDs
        await session.refresh(electronics)
        await session.refresh(clothing)
        await session.refresh(home)

        # Create items
        items = [
            Article(
                title="Laptop Pro",
                description="High performance laptop",
                price=1200.0,
                shipping_cost=20.0,
                is_approved=True,
                category_id=electronics.id,
                seller_id=admin.id,
            ),
            Article(
                title="Wireless Mouse",
                description="Ergonomic wireless mouse",
                price=30.0,
                shipping_cost=5.0,
                is_approved=True,
                category_id=electronics.id,
                seller_id=admin.id,
            ),
            Article(
                title="Cotton T-Shirt",
                description="Comfortable everyday wear",
                price=15.0,
                shipping_cost=2.0,
                is_approved=True,
                category_id=clothing.id,
                seller_id=admin.id,
            ),
        ]
        session.add_all(items)
        await session.commit()

        print("Database seeded successfully!")


if __name__ == "__main__":
    asyncio.run(seed())
