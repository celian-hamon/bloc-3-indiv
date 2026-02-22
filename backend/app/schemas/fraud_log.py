from datetime import datetime

from pydantic import BaseModel


class FraudLogBase(BaseModel):
    article_id: int
    seller_id: int
    old_price: float
    new_price: float
    change_pct: float
    reason: str
    is_suspicious: bool
    resolved: bool = False


class FraudLog(FraudLogBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
