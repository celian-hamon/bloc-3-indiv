from pydantic import BaseModel


class CategoryBase(BaseModel):
    name: str | None = None
    description: str | None = None


class CategoryCreate(CategoryBase):
    name: str


class Category(CategoryBase):
    id: int

    class Config:
        from_attributes = True
