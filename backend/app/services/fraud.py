import logging

logger = logging.getLogger(__name__)


async def check_price_change(
    article_id: int,
    old_price: float,
    new_price: float,
    seller_id: int,
) -> dict:
    """
    Fraud detection service for price changes.
    Flags suspicious price changes (e.g., increase > 50%).
    In production, this would call an external fraud detection API.
    """
    is_suspicious = False
    reason = ""

    if old_price > 0:
        change_pct = abs(new_price - old_price) / old_price * 100
        if change_pct > 50:
            is_suspicious = True
            reason = f"Price changed by {change_pct:.1f}% (from {old_price} to {new_price})"

    result = {
        "article_id": article_id,
        "seller_id": seller_id,
        "old_price": old_price,
        "new_price": new_price,
        "is_suspicious": is_suspicious,
        "reason": reason,
    }

    if is_suspicious:
        logger.warning("FRAUD ALERT: %s", result)
    else:
        logger.info("Price change OK: article %s, %s -> %s", article_id, old_price, new_price)

    return result
