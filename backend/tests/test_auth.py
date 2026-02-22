from fastapi.testclient import TestClient

from app.models.user import User


def test_register_and_login(client: TestClient):
    """Test user registration and login flow."""
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "newuser@test.com", "password": "testpass123", "role": "seller"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "newuser@test.com"
    assert data["role"] == "seller"

    response = client.post(
        "/api/v1/auth/login/access-token",
        data={"username": "newuser@test.com", "password": "testpass123"},
    )
    assert response.status_code == 200
    tokens = response.json()
    assert "access_token" in tokens
    assert tokens["token_type"] == "bearer"


def test_register_duplicate_email(client: TestClient, seller_user: User):
    """Registering with an existing email fails."""
    response = client.post(
        "/api/v1/auth/register",
        json={"email": seller_user.email, "password": "testpass123", "role": "buyer"},
    )
    assert response.status_code == 400


def test_register_invalid_role(client: TestClient):
    """Registering with an invalid role fails."""
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "bad@test.com", "password": "testpass123", "role": "hacker"},
    )
    assert response.status_code == 400


def test_login_wrong_password(client: TestClient, seller_user: User):
    """Login with wrong password fails."""
    response = client.post(
        "/api/v1/auth/login/access-token",
        data={"username": seller_user.email, "password": "wrongpassword"},
    )
    assert response.status_code == 400
