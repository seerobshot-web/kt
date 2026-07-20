# Kingdom Treatz — PRD

## Original Problem Statement
Multi-directive brief for the "Kingdom Treatz" bakery site (acting as a multi-disciplinary dev team):
1. GitHub repo review & QA audit — fix build/rendering bugs.
2. Square SDK/API sandbox config; remove "50% Deposit" payment option; validate Square form; add "Square Brand Approved" badge near checkout/footer.
3. Restructure "About Us" (`/learn-more`) page: add Mission Statement + About the Founder placeholder sections.
4. Brand logo/typography update: minimalist cupcake graphic + WordMark-style font for "KINGDOM TREATZ", complementary pink highlight.
5. Asset cleanup: purge mismatched photos, leave exactly 2 consistent photos (user to upload final photos separately).

## User Choices (this session)
- Square sandbox keys: use placeholders in `.env` now, user adds real sandbox keys later.
- Photo cleanup: DEFERRED — wait for user to upload the 2 final photos before touching images.
- Pink accent: use the existing theme's complementary pink (kt-rouge / kt-blush), not a new hex.
- Logo: user has an existing logo asset (not yet uploaded) — do not AI-generate a new logo.
- About Us: restructure the existing `/learn-more` page (not a new `/about` route).

## Architecture
- Next.js 16 (App Router, TS, Tailwind v4) app — moved from `/app` root into `/app/frontend` to match the platform's supervisor config (`yarn start` on port 3000).
- NEW: Python FastAPI backend at `/app/backend` (uvicorn on port 8001) — created because the platform's ingress routes all external `/api/*` requests to port 8001, not to Next.js's own `/api` routes on port 3000. The old `frontend/src/app/api/checkout/route.ts` was removed (dead code — never reachable externally).
- `POST /api/checkout` (FastAPI): validates customer + cart items + Square `sourceId`, computes subtotal from `backend/catalog.py`, calls Square Payments API (sandbox by default via `SQUARE_ENVIRONMENT`), sends order email via smtplib if `SMTP_PASS` is set.
- No MongoDB usage — this app has no persistence requirement (payment goes straight to Square + optional email notification).

## What's Been Implemented (2026-07-20)
- Fixed critical infra bug: `/api/checkout` was 502'ing externally; now backed by a real FastAPI service on 8001.
- Removed "Pay 50% Deposit" option from `/checkout` — single "Pay Full Amount" flow.
- Added "Square Brand Approved · Secure Checkout" badge near the card details section on `/checkout`.
- Square SDK/env wired for sandbox (`NEXT_PUBLIC_SQUARE_ENVIRONMENT=sandbox`, `SQUARE_ENVIRONMENT=sandbox`) with placeholder credentials pending user's real sandbox keys.
- `/learn-more` (About Us): added "Mission Statement" and "About the Founder" sections with clean placeholder copy, alongside existing Brand Story / Process / Contact sections.
- Header: replaced cropped `logo.jpg` image with a minimalist wordmark (CakeSlice icon + "KINGDOM TREATZ" in Fredoka font, "TREATZ" in kt-rouge pink).
- Footer: brand name restyled with the same two-tone wordmark treatment.
- Verified via testing_agent: all pages 200 OK, checkout flow (minus deposit) works, badge/wordmark/About Us sections all present, no regressions in cart/menu/specials.

## Deferred / Backlog
- **P0**: User to provide real Square Sandbox credentials (`SQUARE_ACCESS_TOKEN`, `NEXT_PUBLIC_SQUARE_APPLICATION_ID`, `LOCATION_ID`) in `/app/backend/.env` and `/app/frontend/.env` to fully test card tokenization + payment.
- **P0**: User to upload the 2 final photos; then purge all other/mismatched images from `/app/frontend/public/images` and update `Hero.tsx`, `FeaturedGrid.tsx`, `menu/page.tsx`, `ProductCard` usages to reference only those 2.
- **P1**: User to provide final logo asset (cupcake graphic) to replace the interim CakeSlice icon wordmark.
- **P1**: User to provide final Mission Statement + Founder bio copy for `/learn-more`.
- **P2**: Consider zustand `persist` middleware for cart so it survives hard refresh (currently in-memory, non-blocking).

## Test Credentials
No user auth in this app — nothing to add to test_credentials.md.
