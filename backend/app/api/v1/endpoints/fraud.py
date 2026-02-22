from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app import models, schemas
from app.api import deps
from app.db.session import get_db

router = APIRouter()


@router.get("/", response_model=list[schemas.FraudLog])
async def list_fraud_logs(
    skip: int = 0,
    limit: int = 100,
    suspicious_only: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_admin),
) -> Any:
    """
    List fraud logs. Admin only.
    """
    query = select(models.FraudLog)
    if suspicious_only:
        query = query.where(models.FraudLog.is_suspicious == True)
    query = query.order_by(models.FraudLog.id.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.put("/{log_id}/resolve", response_model=schemas.FraudLog)
async def resolve_fraud_log(
    *,
    log_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_admin),
) -> Any:
    """
    Mark a fraud log as resolved. Admin only.
    """
    result = await db.execute(select(models.FraudLog).where(models.FraudLog.id == log_id))
    log = result.scalars().first()
    if not log:
        raise HTTPException(status_code=404, detail="Fraud log not found")

    log.resolved = True
    await db.commit()
    await db.refresh(log)
    return log
