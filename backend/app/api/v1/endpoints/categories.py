from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app import models, schemas
from app.api import deps
from app.db.session import get_db

router = APIRouter()


@router.get("/", response_model=list[schemas.Category])
async def list_categories(
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    List all categories. Public endpoint.
    """
    result = await db.execute(select(models.Category))
    return result.scalars().all()


@router.post("/", response_model=schemas.Category)
async def create_category(
    *,
    db: AsyncSession = Depends(get_db),
    category_in: schemas.CategoryCreate,
    current_user: models.User = Depends(deps.get_current_admin),
) -> Any:
    """
    Create a new category. Admin only.
    """
    # Check for duplicate
    result = await db.execute(select(models.Category).where(models.Category.name == category_in.name))
    existing = result.scalars().first()
    if existing:
        raise HTTPException(status_code=400, detail="Category with this name already exists.")

    category = models.Category(
        name=category_in.name,
        description=category_in.description,
    )
    db.add(category)
    await db.commit()
    await db.refresh(category)
    return category


@router.delete("/{category_id}")
async def delete_category(
    *,
    category_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_admin),
) -> Any:
    """
    Delete a category. Admin only.
    """
    result = await db.execute(select(models.Category).where(models.Category.id == category_id))
    category = result.scalars().first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    await db.delete(category)
    await db.commit()
    return {"detail": "Category deleted"}
