from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app import models, schemas
from app.api import deps
from app.db.session import get_db
from app.services.fraud import check_price_change

router = APIRouter()


@router.get("/", response_model=list[schemas.Article])
async def list_articles(
    skip: int = 0,
    limit: int = 100,
    category_id: int = None,
    search: str = None,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Browse the catalog. Public endpoint — no authentication required.
    Only returns approved articles. Supports category and text search filtering.
    """
    query = select(models.Article).where(models.Article.is_approved == True, models.Article.is_sold == False)
    if category_id:
        query = query.where(models.Article.category_id == category_id)
    if search:
        search_filter = f"%{search}%"
        query = query.where(models.Article.title.ilike(search_filter) | models.Article.description.ilike(search_filter))
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/admin/all", response_model=list[schemas.Article])
async def list_all_articles(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_admin),
) -> Any:
    """
    List ALL articles (including unapproved). Admin only.
    """
    query = select(models.Article).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/mine", response_model=list[schemas.Article])
async def list_my_articles(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    List current user's own articles (including unapproved).
    """
    query = select(models.Article).where(models.Article.seller_id == current_user.id).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{article_id}", response_model=schemas.Article)
async def get_article(
    article_id: int,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Get article detail. Public endpoint.
    """
    result = await db.execute(select(models.Article).where(models.Article.id == article_id))
    article = result.scalars().first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return article


@router.post("/", response_model=schemas.Article)
async def create_article(
    *,
    db: AsyncSession = Depends(get_db),
    article_in: schemas.ArticleCreate,
    current_user: models.User = Depends(deps.get_current_seller),
) -> Any:
    """
    Create a new article for sale. Seller or admin role required.
    Article starts as unapproved and must be approved by an admin.
    """
    article = models.Article(
        title=article_in.title,
        description=article_in.description,
        price=article_in.price,
        shipping_cost=article_in.shipping_cost,
        image_url=article_in.image_url,
        category_id=article_in.category_id,
        seller_id=current_user.id,
        is_approved=False,
    )
    db.add(article)
    await db.commit()
    await db.refresh(article)
    return article


@router.put("/{article_id}", response_model=schemas.Article)
async def update_article(
    *,
    article_id: int,
    db: AsyncSession = Depends(get_db),
    article_in: schemas.ArticleUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update an article. Only the seller who owns it or an admin can update.
    """
    result = await db.execute(select(models.Article).where(models.Article.id == article_id))
    article = result.scalars().first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    if article.seller_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not allowed to update this article")

    update_data = article_in.model_dump(exclude_unset=True)

    # Check for price fraud if price is being updated
    if "price" in update_data and update_data["price"] != article.price:
        fraud_result = await check_price_change(
            article_id=article.id,
            old_price=article.price,
            new_price=update_data["price"],
            seller_id=current_user.id,
            db=db,
        )
        if fraud_result["is_suspicious"]:
            raise HTTPException(
                status_code=400,
                detail=f"Price change flagged as suspicious: {fraud_result['reason']}. Contact support.",
            )

    for field, value in update_data.items():
        setattr(article, field, value)

    await db.commit()
    await db.refresh(article)
    return article


@router.put("/{article_id}/price", response_model=schemas.Article)
async def update_article_price(
    *,
    article_id: int,
    db: AsyncSession = Depends(get_db),
    price_update: schemas.ArticlePriceUpdate,
    current_user: models.User = Depends(deps.get_current_seller),
) -> Any:
    """
    Update article price. Triggers fraud detection service.
    """
    result = await db.execute(select(models.Article).where(models.Article.id == article_id))
    article = result.scalars().first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    if article.seller_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not allowed to update this article")

    old_price = article.price

    # Fraud detection
    fraud_result = await check_price_change(
        article_id=article.id,
        old_price=old_price,
        new_price=price_update.price,
        seller_id=current_user.id,
        db=db,
    )

    if fraud_result["is_suspicious"]:
        raise HTTPException(
            status_code=400, detail=f"Price change flagged as suspicious: {fraud_result['reason']}. Contact support."
        )

    article.price = price_update.price
    await db.commit()
    await db.refresh(article)
    return article


@router.put("/{article_id}/approve", response_model=schemas.Article)
async def approve_article(
    *,
    article_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_admin),
) -> Any:
    """
    Approve an article for listing. Admin only.
    """
    result = await db.execute(select(models.Article).where(models.Article.id == article_id))
    article = result.scalars().first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    article.is_approved = True
    await db.commit()
    await db.refresh(article)
    return article


@router.delete("/{article_id}")
async def delete_article(
    *,
    article_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete an article. Only the seller who owns it or an admin can delete.
    """
    result = await db.execute(select(models.Article).where(models.Article.id == article_id))
    article = result.scalars().first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    if article.seller_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not allowed to delete this article")

    await db.delete(article)
    await db.commit()
    return {"detail": "Article deleted"}
