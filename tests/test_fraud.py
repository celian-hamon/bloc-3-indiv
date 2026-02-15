"""Unit tests for the fraud detection service."""

import pytest

from app.services.fraud import check_price_change


@pytest.mark.asyncio
async def test_normal_price_change():
    """Price change ≤ 50% should NOT be flagged."""
    result = await check_price_change(article_id=1, old_price=100.0, new_price=140.0, seller_id=1)
    assert result["is_suspicious"] is False
    assert result["reason"] == ""


@pytest.mark.asyncio
async def test_suspicious_price_increase():
    """Price increase > 50% should be flagged."""
    result = await check_price_change(article_id=1, old_price=100.0, new_price=200.0, seller_id=1)
    assert result["is_suspicious"] is True
    assert "100.0%" in result["reason"]


@pytest.mark.asyncio
async def test_suspicious_price_decrease():
    """Price decrease > 50% should also be flagged."""
    result = await check_price_change(article_id=1, old_price=100.0, new_price=30.0, seller_id=1)
    assert result["is_suspicious"] is True
    assert "70.0%" in result["reason"]


@pytest.mark.asyncio
async def test_zero_old_price():
    """When old price is 0, no percentage can be calculated — not suspicious."""
    result = await check_price_change(article_id=1, old_price=0.0, new_price=50.0, seller_id=1)
    assert result["is_suspicious"] is False


@pytest.mark.asyncio
async def test_exact_threshold():
    """Price change of exactly 50% should NOT be flagged (threshold is > 50%)."""
    result = await check_price_change(article_id=1, old_price=100.0, new_price=150.0, seller_id=1)
    assert result["is_suspicious"] is False


@pytest.mark.asyncio
async def test_result_contains_metadata():
    """Result dict should contain all expected fields."""
    result = await check_price_change(article_id=42, old_price=100.0, new_price=110.0, seller_id=7)
    assert result["article_id"] == 42
    assert result["seller_id"] == 7
    assert result["old_price"] == 100.0
    assert result["new_price"] == 110.0
