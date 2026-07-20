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
- Python FastAPI backend at `/app/backend` (uvicorn on port 8001) — created because the platform's ingress routes all external `/api/*` requests to port 8001, not to Next.js's own `/api` routes on port 3000. The old `frontend/src/app/api/checkout/route.ts` was removed (dead code — never reachable externally).
- `POST /api/checkout` (FastAPI): validates customer + cart items + Square `sourceId`, computes subtotal from `backend/catalog.py`, calls Square Payments API (sandbox by default via `SQUARE_ENVIRONMENT`), sends order email via smtplib if `SMTP_PASS` is set.
- MongoDB (via motor, `kingdom_treatz` DB) now used for the `users`, `login_attempts` collections backing email/password auth (JWT in httpOnly cookie). No order persistence yet — payments go straight to Square + optional email notification.

## What's Been Implemented (2026-07-20)
- Fixed critical infra bug: `/api/checkout` was 502'ing externally; now backed by a real FastAPI service on 8001.
- Removed "Pay 50% Deposit" option from `/checkout` — single "Pay Full Amount" flow.
- Added "Square Brand Approved · Secure Checkout" badge near the card details section on `/checkout`.
- Square SDK/env wired for sandbox (`NEXT_PUBLIC_SQUARE_ENVIRONMENT=sandbox`, `SQUARE_ENVIRONMENT=sandbox`) with placeholder credentials pending user's real sandbox keys.
- `/learn-more` (About Us): added "Mission Statement" and "About the Founder" sections with clean placeholder copy, alongside existing Brand Story / Process / Contact sections.
- Header: replaced cropped `logo.jpg` image with a minimalist wordmark (CakeSlice icon + "KINGDOM TREATZ" in Fredoka font, "TREATZ" in kt-rouge pink).
- Footer: brand name restyled with the same two-tone wordmark treatment.
- Verified via testing_agent: all pages 200 OK, checkout flow (minus deposit) works, badge/wordmark/About Us sections all present, no regressions in cart/menu/specials.

## What's Been Implemented (2026-07-20, cont'd)
- Added email/password authentication (JWT httpOnly cookie, bcrypt, MongoDB `users` collection via motor): `/register`, `/login`, `/account` pages, `/api/auth/register|login|logout|me` on FastAPI backend, brute-force lockout (5 attempts/15min). Header shows account dropdown (Log In/Create Account when logged out, My Account when logged in). Checkout auto-fills name/email from logged-in account.
- Testing agent found & main agent fixed a timezone-naive vs aware datetime bug in `auth.py::check_lockout` (was causing a 500 instead of a 429 on the 6th failed login).
- Product photos: added real per-item photos — Classic Banana Pudding & Cookie Butter Banana Pudding use `banana-pudding.png`, Strawberry Banana Pudding uses `strawberry-banana-pudding.png` (both user-provided), replacing the generic cookies.png placeholder for those 3 items. Other items still use `cookies.png` as fallback pending more product photos.

## What's Been Implemented (2026-07-20, cont'd 2)
- Reviewed Square Web Payments SDK docs (overview + reference) per user request. Confirmed our checkout implementation already matches Square's recommended flow (`Square.payments(appId, locationId)` → `payments.card()` → `card.attach()` → `card.tokenize()` → POST to backend).
- **Important finding applied**: Since Oct 1, 2025 Square requires Secure Contexts + a proper Content-Security-Policy for all Web Payments SDK integrations. Added CSP header (`/checkout` route) in `next.config.ts` allowlisting `web.squarecdn.com` / `sandbox.web.squarecdn.com` (script-src, frame-src), `pci-connect.squareup(sandbox).com` (connect-src), and Square's font CDN. Verified via browser console — no CSP violations, Square SDK script loads and executes correctly (only remaining error is the expected placeholder App ID format error).
- Site is HTTPS-served already (Secure Context requirement met).

## Deferred / Backlog
- **P0**: User to provide real Square Sandbox credentials (`SQUARE_ACCESS_TOKEN`, `NEXT_PUBLIC_SQUARE_APPLICATION_ID`, `LOCATION_ID`) in `/app/backend/.env` and `/app/frontend/.env` to fully test card tokenization + payment.
- **P1**: More product photos still needed for: Brown Butter Pound Cake, Sweet Potato Pie/Tarts, Pecan Pie, Peach Cobbler, and all Cookies category items (currently fall back to the generic cookies.png photo).
- **P1**: User to provide final Mission Statement + Founder bio copy for `/learn-more` (mission copy now live; founder bio text still placeholder, photo is live).
- **P2**: Consider zustand `persist` middleware for cart so it survives hard refresh (currently in-memory, non-blocking).
- **P2**: Add `data-testid` to checkout form inputs (name/phone/email/pickup-date) and product add-to-cart buttons for more reliable E2E testing (flagged by testing_agent).
- **P2**: No order history/admin dashboard yet — orders aren't persisted to MongoDB, only sent to Square + emailed. Add if user wants account order history.
- **P3**: `/api/auth/register` has no rate-limiting (only login has brute-force lockout) — low-risk spam vector, add if abuse observed.

## Test Credentials
No pre-seeded accounts. Auth is self-serve via `/register`. Test account used during QA: `qa.tester@example.com` / `testpass123` (created by testing_agent, may not persist across DB resets).

