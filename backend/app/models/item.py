from sqlalchemy import Boolean, Column, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.session import Base


class Article(Base):
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)
    price = Column(Float, nullable=False)
    shipping_cost = Column(Float, default=0.0)
    image_url = Column(String, nullable=True)
    is_approved = Column(Boolean, default=False)

    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    category = relationship("Category", backref="articles")
    seller = relationship("User", backref="articles")
