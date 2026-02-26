from datetime import datetime
from pydantic import BaseModel


class TokenPayload(BaseModel):
    sub: str | None = None


class MessageCreate(BaseModel):
    content: str | None = ""
    file_url: str | None = None


class Message(MessageCreate):
    id: int
    conversation_id: int
    sender_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationCreate(BaseModel):
    article_id: int


class Conversation(BaseModel):
    id: int
    article_id: int
    buyer_id: int
    seller_id: int
    created_at: datetime
    messages: list[Message] = []

    class Config:
        from_attributes = True


class PaymentSimulation(BaseModel):
    amount: float
    success: bool
    transaction_id: str | None = None
