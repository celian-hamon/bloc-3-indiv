from fastapi.testclient import TestClient

from app.models.item import Article
from app.models.user import User


def test_browse_catalog_public(client: TestClient):
    """Catalog browsing should be public (no auth required)."""
    response = client.get("/api/v1/articles/")
    assert response.status_code == 200
    assert response.json() == []


def test_browse_catalog_returns_approved(client: TestClient, approved_article: Article):
    """Catalog only returns approved articles."""
    response = client.get("/api/v1/articles/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == approved_article.title


def test_create_article_as_seller(client: TestClient, seller_headers: dict):
    """Sellers can create articles."""
    response = client.post(
        "/api/v1/articles/",
        headers=seller_headers,
        json={"title": "Rare Sneakers", "price": 150.0, "description": "Limited edition"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Rare Sneakers"
    assert data["price"] == 150.0
    assert data["is_approved"] is False


def test_create_article_as_buyer_fails(client: TestClient, buyer_headers: dict):
    """Buyers cannot create articles."""
    response = client.post(
        "/api/v1/articles/",
        headers=buyer_headers,
        json={"title": "Nope", "price": 10.0},
    )
    assert response.status_code == 403


def test_approve_article_admin(client: TestClient, seller_headers: dict, admin_headers: dict):
    """Admin can approve articles."""
    r = client.post(
        "/api/v1/articles/",
        headers=seller_headers,
        json={"title": "Poster", "price": 25.0},
    )
    article_id = r.json()["id"]

    r = client.put(
        f"/api/v1/articles/{article_id}/approve",
        headers=admin_headers,
    )
    assert r.status_code == 200
    assert r.json()["is_approved"] is True


def test_categories_admin_only(client: TestClient, admin_headers: dict, seller_headers: dict):
    """Only admins can create categories."""
    r = client.post(
        "/api/v1/categories/",
        headers=admin_headers,
        json={"name": "Figurines", "description": "Collectible figurines"},
    )
    assert r.status_code == 200
    assert r.json()["name"] == "Figurines"

    r = client.post(
        "/api/v1/categories/",
        headers=seller_headers,
        json={"name": "Forbidden"},
    )
    assert r.status_code == 403


def test_user_profile(client: TestClient, seller_headers: dict, seller_user: User):
    """Users can view and update their profile."""
    r = client.get("/api/v1/users/me", headers=seller_headers)
    assert r.status_code == 200
    assert r.json()["email"] == seller_user.email

    r = client.put(
        "/api/v1/users/me",
        headers=seller_headers,
        json={"full_name": "Test Seller"},
    )
    assert r.status_code == 200
    assert r.json()["full_name"] == "Test Seller"


def test_delete_article(client: TestClient, seller_headers: dict):
    """Sellers can delete their own articles."""
    r = client.post(
        "/api/v1/articles/",
        headers=seller_headers,
        json={"title": "To Delete", "price": 5.0},
    )
    article_id = r.json()["id"]

    r = client.delete(f"/api/v1/articles/{article_id}", headers=seller_headers)
    assert r.status_code == 200
    assert r.json()["detail"] == "Article deleted"


def test_update_article_price(client: TestClient, seller_headers: dict):
    """Sellers can update article price (non-suspicious change)."""
    r = client.post(
        "/api/v1/articles/",
        headers=seller_headers,
        json={"title": "Price Test", "price": 100.0},
    )
    article_id = r.json()["id"]

    r = client.put(
        f"/api/v1/articles/{article_id}/price",
        headers=seller_headers,
        json={"price": 120.0},
    )
    assert r.status_code == 200
    assert r.json()["price"] == 120.0


def test_update_article_price_suspicious(client: TestClient, seller_headers: dict):
    """Suspicious price changes (>50%) are rejected."""
    r = client.post(
        "/api/v1/articles/",
        headers=seller_headers,
        json={"title": "Fraud Test", "price": 100.0},
    )
    article_id = r.json()["id"]

    r = client.put(
        f"/api/v1/articles/{article_id}/price",
        headers=seller_headers,
        json={"price": 300.0},
    )
    assert r.status_code == 400
    assert "suspicious" in r.json()["detail"].lower()
