# Kingdom Treatz — Test Credentials

## Customer accounts
No pre-seeded accounts exist. Auth is self-serve email/password (customer accounts only, no admin role).
Register via `POST /api/auth/register` or the `/register` page:
```
{"name": "Test User", "email": "test@example.com", "password": "yourpassword123"}
```

## Admin/CRM portal
Single shared staff passcode (no per-staff accounts): `kingdomtreatz-staff-2026`
- Set via `ADMIN_PASSCODE` in `/app/frontend/.env` — **change this before go-live**.
- Login at `/admin/login`.

## Square (payments)
Still placeholder values in `/app/frontend/.env` (`SQUARE_ACCESS_TOKEN`, `SQUARE_LOCATION_ID`, `NEXT_PUBLIC_SQUARE_APPLICATION_ID`, `NEXT_PUBLIC_SQUARE_LOCATION_ID`) — user will supply real sandbox/production keys.
