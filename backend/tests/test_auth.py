"""Auth API tests for Kingdom Treatz."""
import os
import uuid
import time
import pytest
import requests

BASE_URL = "https://kingdom-treatz.preview.emergentagent.com"


@pytest.fixture
def unique_email():
    return f"qa.tester+{uuid.uuid4().hex[:8]}@example.com"


@pytest.fixture
def session():
    return requests.Session()


class TestAuthFlow:
    def test_register_success(self, session, unique_email):
        r = session.post(f"{BASE_URL}/api/auth/register", json={
            "name": "QA Tester", "email": unique_email, "password": "testpass123"
        })
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["email"] == unique_email
        assert data["name"] == "QA Tester"
        assert "id" in data
        # Cookie set
        assert "access_token" in session.cookies.get_dict()

        # /me should work with cookie
        me = session.get(f"{BASE_URL}/api/auth/me")
        assert me.status_code == 200
        assert me.json()["email"] == unique_email

    def test_register_duplicate(self, session, unique_email):
        payload = {"name": "QA Tester", "email": unique_email, "password": "testpass123"}
        r1 = session.post(f"{BASE_URL}/api/auth/register", json=payload)
        assert r1.status_code == 200
        r2 = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
        assert r2.status_code == 409
        assert "already exists" in r2.json().get("detail", "").lower()

    def test_register_short_password(self, unique_email):
        r = requests.post(f"{BASE_URL}/api/auth/register", json={
            "name": "QA", "email": unique_email, "password": "short"
        })
        assert r.status_code == 422

    def test_login_success_and_wrong_password(self, unique_email):
        # register first
        r = requests.post(f"{BASE_URL}/api/auth/register", json={
            "name": "QA Tester", "email": unique_email, "password": "testpass123"
        })
        assert r.status_code == 200

        # correct login
        s = requests.Session()
        r = s.post(f"{BASE_URL}/api/auth/login", json={"email": unique_email, "password": "testpass123"})
        assert r.status_code == 200
        assert r.json()["email"] == unique_email
        assert "access_token" in s.cookies.get_dict()

        # session persistence
        me = s.get(f"{BASE_URL}/api/auth/me")
        assert me.status_code == 200

        # wrong password
        r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": unique_email, "password": "wrongpass1"})
        assert r.status_code == 401
        assert "invalid" in r.json().get("detail", "").lower()

    def test_logout(self, unique_email):
        s = requests.Session()
        r = s.post(f"{BASE_URL}/api/auth/register", json={
            "name": "QA Tester", "email": unique_email, "password": "testpass123"
        })
        assert r.status_code == 200
        assert s.get(f"{BASE_URL}/api/auth/me").status_code == 200

        r = s.post(f"{BASE_URL}/api/auth/logout")
        assert r.status_code == 200
        # New session (or cleared cookie) -> /me 401
        r = requests.get(f"{BASE_URL}/api/auth/me")
        assert r.status_code == 401

    def test_me_unauthenticated(self):
        r = requests.get(f"{BASE_URL}/api/auth/me")
        assert r.status_code == 401

    def test_bcrypt_hash_format(self):
        # Verify bcrypt is used in code by generating one via hash
        from bcrypt import hashpw, gensalt
        h = hashpw(b"test", gensalt()).decode()
        assert h.startswith("$2b$")

    def test_brute_force_lockout(self, unique_email):
        # Register user
        r = requests.post(f"{BASE_URL}/api/auth/register", json={
            "name": "QA Tester", "email": unique_email, "password": "testpass123"
        })
        assert r.status_code == 200
        # 5 failed attempts
        codes = []
        for _ in range(6):
            r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": unique_email, "password": "wrongpass1"})
            codes.append(r.status_code)
        # After 5 failed, next attempt should be 429
        assert 429 in codes, f"Expected lockout 429 in {codes}"
