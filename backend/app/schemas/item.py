from pydantic import BaseModel

from .user import User


class ArticleBase(BaseModel):
    title: str | None = None
    description: str | None = None
    price: float | None = None
    shipping_cost: float | None = 0.0
    image_url: str | None = None
    category_id: int | None = None


class ArticleCreate(ArticleBase):
    title: str
    price: float


class ArticleUpdate(ArticleBase):
    pass


class ArticlePriceUpdate(BaseModel):
    price: float


class ArticleInDBBase(ArticleBase):
    id: int
    seller_id: int
    is_approved: bool = False

    class Config:
        from_attributes = True


class Article(ArticleInDBBase):
    seller: User | None = None


class ArticleInDB(ArticleInDBBase):
    pass
