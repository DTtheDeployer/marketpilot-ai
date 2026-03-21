# Security

## Authentication

- Password hashing: bcrypt with cost factor 12
- Session tokens: JWT with 7-day expiry, signed with NEXTAUTH_SECRET
- Token transport: Bearer header
- No credentials stored client-side beyond the JWT

## Authorization

Three-tier role system:
- **USER** — Standard authenticated user
- **ADMIN** — Administrative access to user management, system controls
- **SUPER_ADMIN** — Full access including emergency controls

Plan-based feature gating:
- Middleware validates subscription tier before feature access
- Feature entitlements stored in database, not hardcoded
- Upgrade prompts returned as structured API responses

## API Security

- CORS restricted to configured APP_URL origin
- Helmet security headers on all responses
- Request body size limited to 10MB
- All inputs validated with Zod schemas
- SQL injection prevented by Prisma parameterized queries
- No raw SQL queries in application code

## Trading Security

- Live trading requires: ELITE plan + jurisdiction eligibility + risk acknowledgement
- Jurisdiction checks recorded with IP address
- Risk acknowledgements versioned and timestamped
- Order idempotency keys prevent duplicate execution
- Emergency stop capability for admins
- Bot heartbeat monitoring for stale detection

## Data Protection

- Sensitive configuration in environment variables only
- No secrets in client-side bundles
- Database credentials never exposed via API
- Wallet connections stored without private keys
- Stripe handles all payment card data (PCI compliance via Stripe)

## Audit Trail

All security-relevant actions are logged:
- User signup/login
- Bot creation/start/stop
- Subscription changes
- Admin actions
- Feature flag changes
- Emergency stops
- Jurisdiction checks

## Incident Response

- Emergency stop endpoint halts all running bots
- Maintenance mode feature flag disables new bot starts
- System events logged with severity levels
- Structured logging for production monitoring (Sentry-ready)
