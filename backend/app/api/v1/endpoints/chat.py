from typing import Any

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app import models, schemas
from app.api import deps
from app.db.session import get_db

router = APIRouter()


class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[int, list[WebSocket]] = {}

    async def connect(self, ws: WebSocket, conv_id: int):
        await ws.accept()
        if conv_id not in self.active_connections:
            self.active_connections[conv_id] = []
        self.active_connections[conv_id].append(ws)

    def disconnect(self, ws: WebSocket, conv_id: int):
        if conv_id in self.active_connections and ws in self.active_connections[conv_id]:
            self.active_connections[conv_id].remove(ws)
            if not self.active_connections[conv_id]:
                del self.active_connections[conv_id]

    async def broadcast_message(self, message: str, conv_id: int):
        if conv_id in self.active_connections:
            for connection in self.active_connections[conv_id]:
                await connection.send_text(message)


manager = ConnectionManager()


@router.post("/conversations", response_model=schemas.Conversation)
async def create_or_get_conversation(
    *,
    db: AsyncSession = Depends(get_db),
    conversation_in: schemas.ConversationCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    # Get article
    article = await db.get(models.Article, conversation_in.article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    if current_user.id == article.seller_id:
        raise HTTPException(status_code=400, detail="Sellers cannot start a conversation with themselves")

    # Check if conversation already exists
    query = (
        select(models.Conversation)
        .where(models.Conversation.article_id == article.id, models.Conversation.buyer_id == current_user.id)
        .options(selectinload(models.Conversation.messages))
    )
    result = await db.execute(query)
    conversation = result.scalar_one_or_none()

    if conversation:
        return conversation

    # Create new conversation
    conversation = models.Conversation(
        article_id=article.id, buyer_id=current_user.id, seller_id=article.seller_id, messages=[]
    )
    db.add(conversation)
    await db.commit()
    await db.refresh(conversation)
    return conversation


@router.get("/conversations", response_model=list[schemas.Conversation])
async def list_conversations(
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    query = (
        select(models.Conversation)
        .where((models.Conversation.buyer_id == current_user.id) | (models.Conversation.seller_id == current_user.id))
        .options(selectinload(models.Conversation.messages))
    )

    result = await db.execute(query)
    return result.scalars().all()


@router.get("/conversations/{conversation_id}", response_model=schemas.Conversation)
async def get_conversation(
    conversation_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    query = (
        select(models.Conversation)
        .where(models.Conversation.id == conversation_id)
        .options(selectinload(models.Conversation.messages))
    )

    result = await db.execute(query)
    conversation = result.scalar_one_or_none()

    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    if conversation.buyer_id != current_user.id and conversation.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    return conversation


@router.websocket("/conversations/{conversation_id}/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    conversation_id: int,
    token: str,
    db: AsyncSession = Depends(get_db),
):
    from jose import jwt

    from app.core.config import settings

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = int(payload.sub)
    except Exception:
        await websocket.close(code=1008)
        return

    # Check permissions
    conversation = await db.get(models.Conversation, conversation_id)
    if not conversation:
        await websocket.close(code=1008)
        return
    if conversation.buyer_id != user_id and conversation.seller_id != user_id and user_id != 1:  # Simple check
        await websocket.close(code=1008)
        return

    await manager.connect(websocket, conversation_id)
    try:
        while True:
            # We don't really expect clients to send messages via WS directly,
            # but we keep connection open and listen.
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, conversation_id)


@router.post("/conversations/{conversation_id}/messages", response_model=schemas.Message)
async def create_message(
    conversation_id: int,
    message_in: schemas.MessageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    conversation = await db.get(models.Conversation, conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    if conversation.buyer_id != current_user.id and conversation.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    message = models.Message(conversation_id=conversation.id, sender_id=current_user.id, content=message_in.content)
    db.add(message)
    await db.commit()
    await db.refresh(message)

    msg_schema = schemas.Message.model_validate(message)
    await manager.broadcast_message(msg_schema.model_dump_json(), conversation.id)

    return message


@router.post("/conversations/{conversation_id}/checkout", response_model=schemas.PaymentSimulation)
async def mock_checkout(
    conversation_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Mock endpoint to simulate Stripe checkout for buying an item through chat.
    We just pretend we did a stripe call, delete the article if successful.
    """
    conversation = await db.get(models.Conversation, conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    if conversation.buyer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only buyers can checkout here.")

    article = await db.get(models.Article, conversation.article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found or already sold")

    # In a real app we'd trigger a stripe session here and wait for a webhook.
    # For now, simulate absolute success and mark the article as sold (delete it for mocking simplicity).
    import uuid

    tx_id = f"pi_mock_{uuid.uuid4().hex[:12]}"

    # add a message from "system" saying it was purchased
    # we represent system as the seller just to not create a dummy user
    system_msg = models.Message(
        conversation_id=conversation.id,
        sender_id=conversation.seller_id,
        content=(
            f"🛍️ AUTOMATED MESSAGE: Buyer just purchased this item for ${article.price + (article.shipping_cost or 0)}"
        ),
    )
    db.add(system_msg)

    # We could delete the item, or maybe better, add a field or just leave it for the demo
    # We'll just delete the article to mock it being 'bought / removed' from catalog
    await db.delete(article)
    await db.commit()
    await db.refresh(system_msg)

    msg_schema = schemas.Message.model_validate(system_msg)
    await manager.broadcast_message(msg_schema.model_dump_json(), conversation.id)

    return {"amount": article.price + (article.shipping_cost or 0), "success": True, "transaction_id": tx_id}
