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

        # ─── Admin User ───
        admin = User(
            email="admin@celianhamon.fr",
            full_name="Admin User",
            hashed_password=get_password_hash("password123"),
            role="admin",
        )
        session.add(admin)
        await session.commit()
        await session.refresh(admin)

        # ─── Categories ───
        categories_data = [
            ("Electronics", "Smartphones, laptops, tablets, cameras, and other electronic devices"),
            ("Clothing & Accessories", "Apparel, shoes, bags, watches, and fashion accessories"),
            ("Home & Garden", "Furniture, decor, kitchen appliances, and gardening tools"),
            ("Sports & Outdoors", "Sports equipment, outdoor gear, camping, and fitness accessories"),
            ("Books & Media", "Books, vinyl records, DVDs, video games, and digital media"),
            ("Collectibles & Art", "Antiques, coins, stamps, paintings, and rare collectibles"),
            ("Toys & Hobbies", "Toys, board games, model kits, and hobby supplies"),
            ("Automotive", "Car parts, motorcycle accessories, tools, and vehicle electronics"),
            ("Health & Beauty", "Skincare, cosmetics, supplements, and personal care products"),
            ("Music & Instruments", "Musical instruments, audio equipment, and studio gear"),
        ]

        category_objects = []
        for name, description in categories_data:
            cat = Category(name=name, description=description)
            session.add(cat)
            category_objects.append(cat)

        await session.commit()
        for cat in category_objects:
            await session.refresh(cat)

        # ─── Sample Articles ───
        items = [
            Article(
                title="Laptop Pro",
                description="High performance laptop with 16GB RAM and 512GB SSD",
                price=1200.0,
                shipping_cost=20.0,
                is_approved=True,
                category_id=category_objects[0].id,  # Electronics
                seller_id=admin.id,
            ),
            Article(
                title="Wireless Mouse",
                description="Ergonomic wireless mouse with precision tracking",
                price=30.0,
                shipping_cost=5.0,
                is_approved=True,
                category_id=category_objects[0].id,  # Electronics
                seller_id=admin.id,
            ),
            Article(
                title="Cotton T-Shirt",
                description="Comfortable everyday wear, 100% organic cotton",
                price=15.0,
                shipping_cost=2.0,
                is_approved=True,
                category_id=category_objects[1].id,  # Clothing
                seller_id=admin.id,
            ),
        ]
        session.add_all(items)
        await session.commit()

        print(f"Database seeded successfully!")
        print(f"  - 1 admin user (admin@celianhamon.fr / password123)")
        print(f"  - {len(category_objects)} categories")
        print(f"  - {len(items)} sample articles")


if __name__ == "__main__":
    asyncio.run(seed())
