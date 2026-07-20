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
- Next.js 16 (App Router, TS, Tailwind v4) app at `/app/frontend` — this IS the production app (deploys to Hostinger Cloud as a single Node.js app via hPanel, kingdomtreatzrva.com, NOT a static export).
- **All checkout, Square Order/Customer, and admin/CRM logic lives natively in Next.js** (route.ts handlers + `src/proxy.ts`, Next 16's renamed `middleware.ts`), using the official `square` npm package — this is what actually ships to Hostinger.
- `/app/backend` (Python FastAPI, port 8001) still exists ONLY because Emergent's preview-environment ingress always routes external `/api/*` to port 8001, never to Next.js's port 3000. It now does two things: (1) serves `/api/auth/*` directly (pre-existing customer email/password login), (2) transparently reverse-proxies `/api/checkout` and `/api/admin/*` to `http://localhost:3000` (preserving cookies/headers/body) so the real Next.js logic runs unchanged. **This proxy is an Emergent-preview-only accommodation — on Hostinger there is no Python service at all, Next.js serves everything directly.**
- MongoDB (via motor, `kingdom_treatz` DB): `users`, `login_attempts` collections back customer email/password auth only. Square Orders/Customers are the source of truth for orders/CRM data — no separate order DB (per explicit user instruction, "let Square's own order state represent balance due").

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

## What's Been Implemented (2026-07-20, cont'd 3 — major feature)
- **Pickup cutoff logic** (`src/lib/pickup.ts`): shared `getAvailablePickupDates()` (luxon, America/New_York) — Fri/Sat pickup only, Wednesday 9 PM cutoff, rolls forward weekly, no hardcoded dates. `PICKUP_WINDOWS` (friday/saturday hour text) are explicit `TBD` placeholders — **owner must fill in real hours before go-live**. Used by both `/checkout` and `/admin/take-payment`, server-validated (`isValidPickupSelection`) so a tampered date can never reach Square.
- **Square Order + Customer creation** (`src/lib/squareOrders.ts`, official `square` npm SDK): checkout now upserts a Customer by email, creates an OPEN Order with line items + PICKUP fulfillment (customer_id, resolved pickup date, window note), then creates a Payment referencing that order_id — replacing the old raw-fetch payment-only flow. Deposit support (50%, `autocomplete:false`) is available for admin `take-payment` only; customer-facing `/checkout` still stays full-payment-only (per earlier explicit user decision to remove customer deposit UI) — **flagging this to user: the new spec's section B describes deposit orders generally; implemented deposit capability in the admin/CRM layer only, customer checkout unchanged. Confirm if customer-facing deposit should return.**
- **Staff admin/CRM portal** (`/admin/*`, `/api/admin/*`): single shared `ADMIN_PASSCODE` (currently `kingdomtreatz-staff-2026`, **must be changed before go-live**), signed JWT session cookie (`ADMIN_SESSION_SECRET`), in-memory rate limiting (5 attempts/15min/IP). `src/proxy.ts` (Next 16's middleware.ts) protects all `/admin/*` pages + `/api/admin/*` routes. Pages: dashboard (upcoming pickups grouped by date), customers (list/search/new/[id] with last/next order + transaction statement + archive), orders (list/[id] with mark fulfilled/canceled, collect remaining balance, issue refunds), take-payment (virtual terminal reusing the Square card() SDK pattern, full or 50% deposit). Admin UI intentionally plain (own layout, no customer header/footer/cart).
- **CSP header** extended to also cover `/admin/:path*` (previously only `/checkout`). Added Hostinger LiteSpeed fallback at `/app/frontend/.htaccess` in case the proxy strips Next.js's header — verify in production with `curl -I` and delete if unnecessary.
- Tested via testing_agent (iteration 3): 14/14 backend pytest pass, all admin/checkout/pickup/CSP/regression checks pass. Two minor items found & fixed: (1) CSP was blocking Cloudflare's analytics beacon — added `static.cloudflareinsights.com` to script-src/connect-src; (2) admin rate-limiter didn't reset failure count after a lockout expired — fixed so a single post-lockout failure doesn't immediately re-lock.

## Deferred / Backlog
- **P0**: User to provide real Square credentials: `SQUARE_ACCESS_TOKEN`, `SQUARE_LOCATION_ID`, `SQUARE_ENVIRONMENT`, `NEXT_PUBLIC_SQUARE_APPLICATION_ID`, `NEXT_PUBLIC_SQUARE_LOCATION_ID` — see "New env vars" below for exact file/keys.
- **P0**: Owner must set real `PICKUP_WINDOWS.friday` / `.saturday` hour text in `src/lib/pickup.ts` before go-live (currently `TBD` placeholders).
- **P0**: Change `ADMIN_PASSCODE` from the current placeholder (`kingdomtreatz-staff-2026`) to a real staff passcode before go-live.
- **P0**: Confirm with user whether customer-facing `/checkout` should regain a 50% deposit option (this session's spec described deposit orders generally; deposit capability was only added to the admin/take-payment side, customer checkout intentionally left as full-payment-only per the earlier explicit removal request).
- **P1**: (Optional/phase 2, explicitly deferred by user) Square webhook receiver (`payment.updated`, `refund.updated`) so `/admin` reflects changes made directly in Square's dashboard without a manual refresh.
- **P1**: More product photos still needed for: Brown Butter Pound Cake, Sweet Potato Pie/Tarts, Pecan Pie, Peach Cobbler, and all Cookies category items (currently fall back to the generic cookies.png photo).
- **P1**: User to provide final Founder bio copy for `/learn-more` (mission copy + founder photo are now live; founder bio text still placeholder).
- **P2**: Consider zustand `persist` middleware for cart so it survives hard refresh (currently in-memory, non-blocking).
- **P2**: No order history on the customer `/account` page yet (orders live in Square, not linked to the customer login system — the two are intentionally separate per this session's "no new customer login" instruction).
- **P3**: `/api/auth/register` has no rate-limiting (only login has brute-force lockout) — low-risk spam vector, add if abuse observed.
- **P3**: Admin rate-limiter and pickup-cutoff math both work correctly but are per-Node-process (in-memory) — fine for Hostinger's single-instance deploy, revisit if horizontally scaled.

## New Env Vars To Set (2026-07-20, cont'd 3)
- `/app/frontend/.env` → `ADMIN_PASSCODE` (change from placeholder), `ADMIN_SESSION_SECRET` (already auto-generated, safe to keep or rotate).
- `/app/frontend/.env` → `SQUARE_ACCESS_TOKEN`, `SQUARE_LOCATION_ID`, `SQUARE_ENVIRONMENT` (server-only, used by `/api/checkout` and all `/api/admin/*` routes).
- `/app/frontend/.env` → `NEXT_PUBLIC_SQUARE_APPLICATION_ID`, `NEXT_PUBLIC_SQUARE_LOCATION_ID`, `NEXT_PUBLIC_SQUARE_ENVIRONMENT` (client-side, used by the Web Payments SDK card form on `/checkout` and `/admin/take-payment`).
- On Hostinger production: enter all of the above in hPanel's Node.js App → Environment Variables screen (never commit `.env` to GitHub).
- `src/lib/pickup.ts` → `PICKUP_WINDOWS.friday` / `.saturday` are code constants, not env vars — edit directly.

## Test Credentials
No pre-seeded customer accounts. Customer auth is self-serve via `/register`. Admin passcode: `kingdomtreatz-staff-2026` (change before go-live).

