from fastapi import APIRouter

from app.api.v1.endpoints import auth, categories, fraud, items, users

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(items.router, prefix="/articles", tags=["articles"])
api_router.include_router(categories.router, prefix="/categories", tags=["categories"])
api_router.include_router(fraud.router, prefix="/fraud-logs", tags=["fraud"])
api_router.include_router(users.router, prefix="/users", tags=["users"])

