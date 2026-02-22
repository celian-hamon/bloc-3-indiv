-- Category seeder for Collector platform
-- Run against your PostgreSQL database:
--   psql -h <host> -U <user> -d <database> -f seed_categories.sql
-- Or via kubectl:
--   kubectl exec -it -n collector deployment/postgres -- psql -U <user> -d <db> -f /tmp/seed.sql

INSERT INTO categories (name, description)
VALUES
    ('Electronics', 'Smartphones, laptops, tablets, cameras, and other electronic devices'),
    ('Clothing & Accessories', 'Apparel, shoes, bags, watches, and fashion accessories'),
    ('Home & Garden', 'Furniture, decor, kitchen appliances, and gardening tools'),
    ('Sports & Outdoors', 'Sports equipment, outdoor gear, camping, and fitness accessories'),
    ('Books & Media', 'Books, vinyl records, DVDs, video games, and digital media'),
    ('Collectibles & Art', 'Antiques, coins, stamps, paintings, and rare collectibles'),
    ('Toys & Hobbies', 'Toys, board games, model kits, and hobby supplies'),
    ('Automotive', 'Car parts, motorcycle accessories, tools, and vehicle electronics'),
    ('Health & Beauty', 'Skincare, cosmetics, supplements, and personal care products'),
    ('Music & Instruments', 'Musical instruments, audio equipment, and studio gear')
ON CONFLICT (name) DO NOTHING;
