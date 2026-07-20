from dotenv import load_dotenv
load_dotenv()

import os

import httpx
from fastapi import Depends, FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field

from db import db
from models import User, UserPublic
from auth import (
    check_lockout,
    clear_failed_attempts,
    create_access_token,
    get_current_user,
    hash_password,
    record_failed_attempt,
    verify_password,
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_origin_regex=r"https://.*\.(preview\.emergentagent\.com|emergentagent\.com)",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)


def to_public(user: User) -> UserPublic:
    return UserPublic(id=user.id, name=user.name, email=user.email)


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2)
    email: EmailStr
    password: str = Field(min_length=8)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)


@app.post('/api/auth/register')
async def register(payload: RegisterRequest, response: Response):
    email = payload.email.lower()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    user = User(name=payload.name, email=email, password_hash=hash_password(payload.password))
    result = await db.users.insert_one(user.to_mongo())
    user.id = str(result.inserted_id)

    token = create_access_token(user.id, user.email)
    response.set_cookie(key="access_token", value=token, httponly=True, secure=True, samesite="none", max_age=60 * 60 * 24 * 7, path="/")
    return to_public(user)


@app.post('/api/auth/login')
async def login(payload: LoginRequest, response: Response):
    email = payload.email.lower()
    await check_lockout(email)

    doc = await db.users.find_one({"email": email})
    if not doc or not verify_password(payload.password, doc["password_hash"]):
        await record_failed_attempt(email)
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    await clear_failed_attempts(email)
    user = User.from_mongo(doc)
    token = create_access_token(user.id, user.email)
    response.set_cookie(key="access_token", value=token, httponly=True, secure=True, samesite="none", max_age=60 * 60 * 24 * 7, path="/")
    return to_public(user)


@app.post('/api/auth/logout')
async def logout(response: Response):
    response.delete_cookie(key="access_token", path="/")
    return {"success": True}


@app.get('/api/auth/me')
async def me(current_user: User = Depends(get_current_user)):
    return to_public(current_user)


# --------------------------------------------------------------------------
# Reverse proxy: /api/checkout and /api/admin/* now live in the Next.js app
# (src/app/api/...), using the official `square` npm package, because that's
# what actually ships to production on Hostinger as a single Node.js app.
# This platform's preview environment always routes external /api/* traffic
# to this Python service (port 8001) rather than the Next.js dev server
# (port 3000), so we forward those specific requests through unchanged —
# including cookies/headers — so admin sessions and Square calls work
# identically in preview and in production.
# --------------------------------------------------------------------------
NEXTJS_INTERNAL_URL = 'http://localhost:3000'
_EXCLUDED_RESPONSE_HEADERS = {'content-encoding', 'transfer-encoding', 'connection'}


async def _proxy_to_nextjs(request: Request, path: str) -> Response:
    url = f'{NEXTJS_INTERNAL_URL}/{path}'
    headers = {k: v for k, v in request.headers.items() if k.lower() != 'host'}
    body = await request.body()

    async with httpx.AsyncClient() as client:
        upstream = await client.request(
            request.method,
            url,
            headers=headers,
            content=body,
            params=request.query_params,
            timeout=30.0,
        )

    response_headers = {k: v for k, v in upstream.headers.items() if k.lower() not in _EXCLUDED_RESPONSE_HEADERS}
    response = Response(content=upstream.content, status_code=upstream.status_code, headers=response_headers)
    for cookie_header in upstream.headers.get_list('set-cookie'):
        response.headers.append('set-cookie', cookie_header)
    return response


@app.api_route('/api/checkout', methods=['POST'])
async def checkout_proxy(request: Request):
    return await _proxy_to_nextjs(request, 'api/checkout')


@app.api_route('/api/admin/{path:path}', methods=['GET', 'POST', 'PATCH', 'PUT', 'DELETE'])
async def admin_proxy(request: Request, path: str):
    return await _proxy_to_nextjs(request, f'api/admin/{path}')
