import os

# Override database URL BEFORE any app imports so the app module
# never tries to create an asyncpg engine.
os.environ["SQLALCHEMY_DATABASE_URI"] = "sqlite+aiosqlite:///:memory:"

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from httpx import AsyncClient  # noqa: E402
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402
from sqlalchemy.pool import StaticPool  # noqa: E402

from app.core.security import create_access_token, get_password_hash  # noqa: E402
from app.db.session import Base, get_db  # noqa: E402
from app.main import app  # noqa: E402
from app.models.category import Category  # noqa: E402
from app.models.item import Article  # noqa: E402
from app.models.user import User  # noqa: E402

# ---------------------------------------------------------------------------
# In-memory SQLite database for tests
# ---------------------------------------------------------------------------
SQLALCHEMY_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, class_=AsyncSession)


async def override_get_db():
    async with TestingSessionLocal() as session:
        yield session


app.dependency_overrides[get_db] = override_get_db

# ---------------------------------------------------------------------------
# Session / backend fixtures
# ---------------------------------------------------------------------------


@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"


@pytest.fixture(autouse=True)
async def _reset_db():
    """Create tables before each test and drop them after."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture()
async def db_session():
    """Provide a transactional async DB session for tests."""
    async with TestingSessionLocal() as session:
        yield session


@pytest.fixture()
def client() -> TestClient:
    return TestClient(app)


@pytest.fixture()
async def async_client():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac


# ---------------------------------------------------------------------------
# User fixtures
# ---------------------------------------------------------------------------
_PASSWORD = "testpass123"
_HASHED = get_password_hash(_PASSWORD)


async def _create_user(db: AsyncSession, email: str, role: str) -> User:
    user = User(
        email=email,
        hashed_password=_HASHED,
        role=role,
        is_active=True,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@pytest.fixture()
async def admin_user(db_session: AsyncSession) -> User:
    return await _create_user(db_session, "admin@test.com", "admin")


@pytest.fixture()
async def seller_user(db_session: AsyncSession) -> User:
    return await _create_user(db_session, "seller@test.com", "seller")


@pytest.fixture()
async def buyer_user(db_session: AsyncSession) -> User:
    return await _create_user(db_session, "buyer@test.com", "buyer")


# ---------------------------------------------------------------------------
# Token fixtures
# ---------------------------------------------------------------------------


def _token_for(user: User) -> str:
    return create_access_token(user.id)


@pytest.fixture()
def admin_token(admin_user: User) -> str:
    return _token_for(admin_user)


@pytest.fixture()
def seller_token(seller_user: User) -> str:
    return _token_for(seller_user)


@pytest.fixture()
def buyer_token(buyer_user: User) -> str:
    return _token_for(buyer_user)


@pytest.fixture()
def admin_headers(admin_token: str) -> dict:
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture()
def seller_headers(seller_token: str) -> dict:
    return {"Authorization": f"Bearer {seller_token}"}


@pytest.fixture()
def buyer_headers(buyer_token: str) -> dict:
    return {"Authorization": f"Bearer {buyer_token}"}


# ---------------------------------------------------------------------------
# Domain entity fixtures
# ---------------------------------------------------------------------------


@pytest.fixture()
async def category(db_session: AsyncSession) -> Category:
    cat = Category(name="Sneakers", description="Limited edition sneakers")
    db_session.add(cat)
    await db_session.commit()
    await db_session.refresh(cat)
    return cat


@pytest.fixture()
async def article(db_session: AsyncSession, seller_user: User) -> Article:
    art = Article(
        title="Rare Poster",
        description="Vintage cinema poster",
        price=75.0,
        seller_id=seller_user.id,
        is_approved=False,
    )
    db_session.add(art)
    await db_session.commit()
    await db_session.refresh(art)
    return art


@pytest.fixture()
async def approved_article(db_session: AsyncSession, seller_user: User) -> Article:
    art = Article(
        title="Star Wars Figurine",
        description="Original Hasbro 1977",
        price=250.0,
        seller_id=seller_user.id,
        is_approved=True,
    )
    db_session.add(art)
    await db_session.commit()
    await db_session.refresh(art)
    return art
