from dotenv import load_dotenv
load_dotenv()

import os
import smtplib
import uuid
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

import httpx
from fastapi import Depends, FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field

from catalog import CATALOG, compute_subtotal_cents
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


class CartItem(BaseModel):
    id: str
    quantity: int = Field(ge=1)


class Customer(BaseModel):
    name: str = Field(min_length=2)
    email: EmailStr
    phone: str = Field(min_length=10)
    pickupDate: str = Field(min_length=1)


class CheckoutRequest(BaseModel):
    customer: Customer
    items: list[CartItem] = Field(min_length=1)
    sourceId: str = Field(min_length=1)


def square_api_base() -> str:
    env = os.environ.get('SQUARE_ENVIRONMENT', 'sandbox').lower()
    return 'https://connect.squareup.com' if env == 'production' else 'https://connect.squareupsandbox.com'


def send_order_email(customer: Customer, items: list[CartItem], subtotal_cents: int, payment_id: str | None):
    smtp_pass = os.environ.get('SMTP_PASS')
    if not smtp_pass:
        print('SMTP_PASS not set; skipping order notification email.')
        return

    smtp_user = os.environ.get('SMTP_USER', 'no-reply@kingdomtreatzrva.com')
    rows = ''
    for item in items:
        entry = CATALOG.get(item.id, {'name': f'Item {item.id}', 'price_cents': 0})
        line_cents = entry['price_cents'] * item.quantity
        rows += f"<tr><td style='padding:10px;border-bottom:1px solid #eee;'>{entry['name']}</td><td style='padding:10px;border-bottom:1px solid #eee;text-align:center;'>{item.quantity}</td><td style='padding:10px;border-bottom:1px solid #eee;text-align:right;'>${line_cents / 100:.2f}</td></tr>"

    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #4A3A35;">
      <h2>New Paid Order</h2>
      <p>A new order has been placed and paid on the website.</p>
      <div style="background:#FFF9F2;padding:20px;border-radius:4px;margin-bottom:20px;">
        <p><strong>Name:</strong> {customer.name}</p>
        <p><strong>Email:</strong> {customer.email}</p>
        <p><strong>Phone:</strong> {customer.phone}</p>
        <p><strong>Pickup Date:</strong> {customer.pickupDate}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <thead><tr><th style="text-align:left;padding:10px;border-bottom:2px solid #4A3A35;">Item</th><th style="padding:10px;border-bottom:2px solid #4A3A35;">Qty</th><th style="text-align:right;padding:10px;border-bottom:2px solid #4A3A35;">Price</th></tr></thead>
        <tbody>{rows}</tbody>
        <tfoot><tr><td colspan="2" style="text-align:right;padding:10px;font-weight:bold;">Total Paid:</td><td style="text-align:right;padding:10px;font-weight:bold;">${subtotal_cents / 100:.2f}</td></tr></tfoot>
      </table>
      <p style="font-size:12px;color:#888;">Square payment id: {payment_id or 'n/a'}</p>
    </div>
    """

    msg = MIMEMultipart('alternative')
    msg['Subject'] = f'New Paid Order - {customer.name}'
    msg['From'] = smtp_user
    msg['To'] = 'info@kingdomtreatzrva.com'
    msg.attach(MIMEText(html, 'html'))

    host = os.environ.get('SMTP_HOST', 'smtp.hostinger.com')
    port = int(os.environ.get('SMTP_PORT', '465'))
    with smtplib.SMTP_SSL(host, port) as server:
        server.login(smtp_user, smtp_pass)
        server.sendmail(smtp_user, ['info@kingdomtreatzrva.com'], msg.as_string())


@app.post('/api/checkout')
async def checkout(payload: CheckoutRequest):
    try:
        subtotal_cents = compute_subtotal_cents([item.model_dump() for item in payload.items])
    except ValueError:
        raise HTTPException(status_code=422, detail='Your cart contains an item that is no longer on the menu. Please rebuild your cart.')

    access_token = os.environ.get('SQUARE_ACCESS_TOKEN')
    location_id = os.environ.get('SQUARE_LOCATION_ID')

    if not access_token or not location_id:
        raise HTTPException(status_code=500, detail='Payment is not configured. Please contact us to complete your order.')

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f'{square_api_base()}/v2/payments',
            headers={'Authorization': f'Bearer {access_token}', 'Content-Type': 'application/json'},
            json={
                'idempotency_key': str(uuid.uuid4()),
                'source_id': payload.sourceId,
                'location_id': location_id,
                'amount_money': {'amount': subtotal_cents, 'currency': 'USD'},
                'buyer_email_address': payload.customer.email,
                'note': f'Kingdom Treatz order — {payload.customer.name} — pickup {payload.customer.pickupDate}'[:500],
            },
        )

    result = response.json()

    if response.status_code != 200 or result.get('payment', {}).get('status') == 'FAILED':
        detail = ', '.join(filter(None, [e.get('detail') or e.get('code') for e in result.get('errors', [])]))
        raise HTTPException(status_code=402, detail=detail or 'Your card could not be charged. Please check your details and try again.')

    payment_id = result.get('payment', {}).get('id')

    try:
        send_order_email(payload.customer, payload.items, subtotal_cents, payment_id)
    except Exception as email_error:
        print(f'Order email failed (payment succeeded): {email_error}')

    return {'success': True, 'paymentId': payment_id}
