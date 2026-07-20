"""Backend API tests for Kingdom Treatz checkout endpoint.

The Square access token is a placeholder in sandbox, so a successful
payment cannot be produced. We validate that the endpoint reaches the
FastAPI backend (not a 502 from Next.js) and returns structured JSON
for validation errors and payment authorization failures.
"""
import os
import pytest
import requests

BASE_URL = "https://b0b1c486-a310-4321-877e-5f653e700291.preview.emergentagent.com"
CHECKOUT = f"{BASE_URL}/api/checkout"


@pytest.fixture
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# Pages load
@pytest.mark.parametrize("path", ["/", "/menu", "/specials", "/learn-more", "/checkout"])
def test_public_pages_return_200(client, path):
    r = client.get(f"{BASE_URL}{path}", timeout=20)
    assert r.status_code == 200, f"{path} returned {r.status_code}"


# Backend routing: empty body should hit FastAPI (422), NOT nginx/502
def test_checkout_reaches_backend_empty_body(client):
    r = client.post(CHECKOUT, json={}, timeout=15)
    assert r.status_code == 422, f"expected pydantic 422, got {r.status_code}: {r.text[:200]}"
    body = r.json()
    assert "detail" in body


def test_checkout_invalid_item_id(client):
    payload = {
        "customer": {
            "name": "TEST User",
            "email": "test@example.com",
            "phone": "5551234567",
            "pickupDate": "2026-02-01",
        },
        "items": [{"id": "nonexistent-item", "quantity": 1}],
        "sourceId": "cnon:card-nonce-ok",
    }
    r = client.post(CHECKOUT, json=payload, timeout=15)
    # should return structured JSON error (not 502)
    assert r.status_code in (400, 422), f"got {r.status_code}: {r.text[:200]}"
    body = r.json()
    assert "detail" in body


def test_checkout_valid_shape_reaches_square(client):
    """Valid shape → backend calls Square sandbox with placeholder token → 401/402 style JSON error.
    Must NOT be 502 (bad gateway) or 500 (internal error).
    """
    payload = {
        "customer": {
            "name": "TEST User",
            "email": "test@example.com",
            "phone": "5551234567",
            "pickupDate": "2026-02-01",
        },
        "items": [{"id": "1", "quantity": 2}],
        "sourceId": "cnon:card-nonce-ok",
    }
    r = client.post(CHECKOUT, json=payload, timeout=20)
    assert r.status_code != 502, "Got 502 - backend routing broken"
    assert r.status_code != 500, f"Unexpected 500: {r.text[:300]}"
    # Expected: 401/402 auth failure from Square (placeholder token) or similar
    assert r.status_code in (400, 401, 402, 403), f"Unexpected status {r.status_code}: {r.text[:300]}"
    body = r.json()
    assert "detail" in body
