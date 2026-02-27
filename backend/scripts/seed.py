import asyncio
import os
import sys

# Add the backend directory to the sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.future import select

from app.core.security import get_password_hash
from app.db.session import AsyncSessionLocal, Base, engine
from app.models.category import Category
from app.models.item import Article
from app.models.user import User


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
                title="Montre Raketa 24 Heures – Villes du Monde – Condor",
                description="Montre Raketa avec affichage 24 heures et villes du monde.",
                price=290.0,
                shipping_cost=10.0,
                is_approved=True,
                category_id=category_objects[5].id,  # Collectibles & Art
                seller_id=admin.id,
            ),
            Article(
                title="Raketa 2609 – Chiffres Laiton",
                description="Montre Raketa vintage calibre 2609 avec chiffres en laiton.",
                price=220.0,
                shipping_cost=8.0,
                is_approved=True,
                category_id=category_objects[5].id,  # Collectibles & Art
                seller_id=admin.id,
            ),
            Article(
                title="Montre Raketa Cercle Arctique – 24 Heures – 469820",
                description="Montre Raketa Cercle Arctique 24 heures édition spéciale 469820.",
                price=240.0,
                shipping_cost=8.0,
                is_approved=True,
                category_id=category_objects[5].id,  # Collectibles & Art
                seller_id=admin.id,
            ),
            Article(
                title="Chronographe Poljot – Années 90 – 3133",
                description="Chronographe Poljot calibre 3133 des années 90.",
                price=390.0,
                shipping_cost=12.0,
                is_approved=True,
                category_id=category_objects[5].id,  # Collectibles & Art
                seller_id=admin.id,
            ),
            Article(
                title="Montre Kama – Années 50 – Nid Abeille",
                description="Authentique montre Kama des années 50 avec cadran nid d'abeille.",
                price=165.0,
                shipping_cost=8.0,
                is_approved=True,
                category_id=category_objects[5].id,  # Collectibles & Art
                seller_id=admin.id,
            ),
            Article(
                title="Raketa Art Déco – 2609 – NOS – Set Complet",
                description="Montre Raketa Art Déco 2609 NOS (New Old Stock) en set complet.",
                price=240.0,
                shipping_cost=10.0,
                is_approved=True,
                category_id=category_objects[5].id,  # Collectibles & Art
                seller_id=admin.id,
            ),
            Article(
                title="Montre Poljot Chronographe 3133 – Visite Gorbatchev Japon 1991",
                description="Montre commémorative de la visite de Mikhaïl Gorbatchev au Japon en 1991.",
                price=580.0,
                shipping_cost=15.0,
                is_approved=True,
                category_id=category_objects[5].id,  # Collectibles & Art
                seller_id=admin.id,
            ),
            Article(
                title="Montre Chronographe – Sekonda 3017 – Cosmonaute",
                description="Rare chronographe Sekonda 3017 modèle Cosmonaute.",
                price=1290.0,
                shipping_cost=25.0,
                is_approved=True,
                category_id=category_objects[5].id,  # Collectibles & Art
                seller_id=admin.id,
            ),
            Article(
                title="Montre Scaphandrier URSS – 191CHS – Zlatoust – Numéro 3001",
                description="Grande montre de scaphandrier de la marine soviétique URSS (Zlatoust).",
                price=1150.0,
                shipping_cost=20.0,
                is_approved=True,
                category_id=category_objects[5].id,  # Collectibles & Art
                seller_id=admin.id,
            ),
            Article(
                title="Poljot Shturmanskie Chronographe – 3133",
                description="Chronographe de l'armée de l'air soviétique Poljot Shturmanskie.",
                price=490.0,
                shipping_cost=15.0,
                is_approved=True,
                category_id=category_objects[5].id,  # Collectibles & Art
                seller_id=admin.id,
            ),
        ]
        session.add_all(items)
        await session.commit()

        print("Database seeded successfully!")
        print("  - 1 admin user (admin@celianhamon.fr / password123)")
        print(f"  - {len(category_objects)} categories")
        print(f"  - {len(items)} sample articles")


if __name__ == "__main__":
    asyncio.run(seed())
