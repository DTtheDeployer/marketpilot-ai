# Architecture

## System Overview

MarketPilot AI is a three-tier architecture:

```
┌─────────────────┐     ┌─────────────────┐     ┌──────────────────┐
│   Next.js Web   │────▶│  Express API    │────▶│  Strategy Engine │
│   (Frontend)    │     │  (Backend)      │     │  (Python/FastAPI) │
└─────────────────┘     └────────┬────────┘     └──────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
              ┌─────▼─────┐ ┌───▼───┐  ┌─────▼─────┐
              │ PostgreSQL │ │ Redis │  │  Stripe   │
              │  (Primary) │ │(Cache)│  │ (Billing) │
              └───────────┘ └───────┘  └───────────┘
```

## Design Decisions

### Monorepo with pnpm Workspaces
Shared types, utilities, and configuration across frontend and backend. Turborepo handles build orchestration and caching.

### Separate Strategy Engine (Python)
Quantitative strategy logic benefits from Python's ecosystem (pandas, numpy). Isolated as a FastAPI service for:
- Independent scaling
- Language-appropriate tooling
- Clean separation from Node.js business logic

### Paper-First Architecture
All trading flows pass through a `TradingMode` check. Paper and live execution share the same interfaces but different adapters. This ensures:
- Users start in a safe environment
- Live execution is an opt-in, gated upgrade
- The same code paths are tested in both modes

### Risk as a First-Class System
Risk validation is not bolted on — it's a required step in every trade execution path. The risk engine sits between signal generation and order execution, with no bypass capability from the user-facing API.

### Feature Gating via Plan Entitlements
Each plan defines feature limits stored in the database. Middleware checks entitlements before allowing access to gated features. This supports:
- Graceful upgrade prompts
- Accurate usage tracking
- Easy plan modification without code changes

## Data Flow: Bot Execution

```
Strategy Engine          API Server              Database
     │                       │                       │
     │   generate_signal()   │                       │
     │◀──────────────────────│   get market data     │
     │                       │──────────────────────▶│
     │   Signal              │                       │
     │──────────────────────▶│                       │
     │                       │   risk.validate()     │
     │                       │──────────┐            │
     │                       │◀─────────┘            │
     │                       │                       │
     │                       │   if approved:        │
     │                       │   create order        │
     │                       │──────────────────────▶│
     │                       │                       │
     │                       │   paper: simulate     │
     │                       │   live: send to CLOB  │
     │                       │                       │
     │                       │   record fill/pnl     │
     │                       │──────────────────────▶│
```

## Security Architecture

- JWT tokens for API authentication
- bcrypt password hashing (cost factor 12)
- Role-based access control (USER, ADMIN, SUPER_ADMIN)
- Plan-based feature gating middleware
- Jurisdiction checks before live trading
- Risk acknowledgement requirements
- Audit logging on all sensitive operations
- CORS restricted to app origin
- Helmet security headers
- Input validation with Zod on all endpoints
- No client-side secret exposure

## Database Design

PostgreSQL with Prisma ORM. Key design choices:
- Soft deletes on bots (preserves history)
- Idempotency keys on orders (prevents duplicates)
- Indexed timestamps for time-series queries
- JSON columns for flexible config/metadata
- Enum types for all status fields
- Comprehensive audit logging
