from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app import schemas
from app.api.deps import optional_oauth2, get_current_user
from app.core import security
from app.core.config import settings
from app.db.session import get_db
from app.models import user as user_model

router = APIRouter()


@router.post("/login/access-token", response_model=schemas.Token)
async def login_access_token(
    db: AsyncSession = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests.
    """
    stmt = select(user_model.User).where(user_model.User.email == form_data.username)
    result = await db.execute(stmt)
    user = result.scalars().first()

    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(user.id, expires_delta=access_token_expires),
        "token_type": "bearer",
    }


@router.post("/register", response_model=schemas.User)
async def register(
    *,
    db: AsyncSession = Depends(get_db),
    user_in: schemas.UserCreate,
    token: str | None = Depends(optional_oauth2),
) -> Any:
    """
    Create new user.
    - buyer / seller: public registration (no auth needed).
    - admin: requires a valid admin JWT.
    """
    if user_in.role not in ("buyer", "seller", "admin"):
        raise HTTPException(status_code=400, detail="Invalid role. Must be buyer, seller, or admin.")

    # Admin creation requires an existing admin's token
    if user_in.role == "admin":
        if not token:
            raise HTTPException(status_code=403, detail="Admin creation requires admin authentication.")
        current_user = await get_current_user(db=db, token=token)
        if current_user.role != "admin":
            raise HTTPException(status_code=403, detail="Only existing admins can create admin accounts.")

    stmt = select(user_model.User).where(user_model.User.email == user_in.email)
    result = await db.execute(stmt)
    user = result.scalars().first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    user = user_model.User(
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=security.get_password_hash(user_in.password),
        role=user_in.role,
        is_active=True,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

