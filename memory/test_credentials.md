# Kingdom Treatz — Test Credentials

No pre-seeded accounts exist. Auth is self-serve email/password (customer accounts only, no admin role).

Register a new account via `POST /api/auth/register` or the `/register` page:
```
{"name": "Test User", "email": "test@example.com", "password": "yourpassword123"}
```

Known accounts created during testing (may not persist across DB resets):
- test-suite: qa.tester@example.com / testpass123
