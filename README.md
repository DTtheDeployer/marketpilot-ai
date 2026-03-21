# MarketPilot AI

**Prediction-market strategy automation platform with institutional-grade risk controls.**

Research, simulate, and deploy automated prediction-market strategies. Paper trade by default. Live execution where legally permitted with full risk management.

---

## Stack

| Layer            | Technology                                           |
|------------------|------------------------------------------------------|
| Monorepo         | pnpm workspaces + Turborepo                          |
| Frontend         | Next.js 15, React 19, TypeScript, Tailwind, shadcn   |
| Backend API      | Express, TypeScript, Prisma, Zod                     |
| Database         | PostgreSQL 16, Prisma ORM                            |
| Cache/Queue      | Redis 7, BullMQ                                      |
| Strategy Engine  | Python 3.12, FastAPI, Pandas, NumPy                  |
| Payments         | Stripe (subscriptions, webhooks, portal)             |
| Auth             | JWT + bcrypt (NextAuth-ready)                        |
| Infra            | Docker, docker-compose                               |

## Monorepo Layout

```
/apps
  /web                    Next.js frontend (marketing + app)
  /api                    Express backend API
  /strategy-engine        Python FastAPI strategy engine

/packages
  /ui                     Shared UI components (Button, Card, Badge, etc.)
  /config                 Shared tsconfig, Tailwind config
  /types                  Shared TypeScript types and enums
  /database               Prisma schema, migrations, seed data
  /auth                   Auth utilities and guards
  /billing                Stripe helpers, plan definitions, feature gating
  /trading                Risk presets, trading utilities
  /analytics              Metrics calculations (Sharpe, drawdown, etc.)
  /notifications          Alert formatting and notification helpers
  /utils                  Shared utilities (formatting, slugify, etc.)

/docs                     Architecture, security, compliance docs
```

## Quick Start

### Prerequisites
- Node.js 20+
- Python 3.12+
- Docker + Docker Compose
- pnpm (or use `npx pnpm`)

### 1. Clone and install

```bash
git clone <repo-url> marketpilot
cd marketpilot
cp .env.example .env.local
npx pnpm install
```

### 2. Start infrastructure

```bash
docker-compose up -d    # PostgreSQL + Redis
```

### 3. Set up database

```bash
npx pnpm db:generate    # Generate Prisma client
npx pnpm db:push        # Push schema to database
npx pnpm db:seed        # Seed demo data
```

### 4. Start development servers

```bash
npx pnpm dev            # Starts all apps concurrently
```

- **Web**: http://localhost:3000
- **API**: http://localhost:3001
- **Strategy Engine**: http://localhost:8000

### 5. Strategy Engine (Python)

```bash
cd apps/strategy-engine
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Environment Variables

See [.env.example](.env.example) for all required variables.

Key variables:
- `DATABASE_URL` — PostgreSQL connection string
- `REDIS_URL` — Redis connection string
- `NEXTAUTH_SECRET` — JWT signing secret
- `STRIPE_SECRET_KEY` — Stripe API key
- `STRATEGY_ENGINE_URL` — Python service URL

## Demo Accounts

After seeding:
- **Admin**: admin@marketpilot.ai / password123
- **User**: demo@marketpilot.ai / password123

## Plans

| Feature              | Explorer (Free) | Strategist ($49/mo) | Operator ($149/mo) |
|----------------------|:---------------:|:-------------------:|:------------------:|
| Paper Trading        |       Yes       |         Yes         |        Yes         |
| Active Strategies    |        1        |          6          |         6          |
| Active Bots          |        1        |          5          |         10         |
| Backtests / month    |        5        |         50          |     Unlimited      |
| Live Trading         |       No        |         No          |        Yes*        |
| Advanced Analytics   |       No        |         Yes         |        Yes         |
| Priority Alerts      |       No        |         No          |        Yes         |

*Live trading requires jurisdiction eligibility and risk acknowledgement.

## Strategies

1. **Spread Capture** — Passive market-making on both sides of the spread
2. **Mean Reversion** — Trade deviations from moving averages
3. **Orderbook Imbalance** — React to bid/ask depth asymmetry
4. **Momentum Surge** — Ride unusual volume and price momentum
5. **Time Decay Repricing** — Exploit convergence near event resolution
6. **Cross-Market Divergence** — Arbitrage correlated market discrepancies

## Risk Controls

- Max daily / weekly loss limits
- Max drawdown enforcement
- Position size and exposure caps
- Order rate limiting
- Loss streak cooldown
- Stale data force-stop
- Emergency stop (admin)
- Conservative / Balanced / Advanced presets

## Testing

```bash
npx pnpm test                           # All tests
cd apps/strategy-engine && pytest        # Python tests
```

## Current Limitations

- Stripe integration is scaffolded but not connected to live Stripe
- Live Polymarket execution adapter is a placeholder
- Email notifications are not wired to SMTP
- 2FA is architecture-ready but not implemented
- WebSocket real-time updates not yet implemented

## Roadmap

- [ ] Stripe checkout integration
- [ ] WebSocket real-time dashboard updates
- [ ] Polymarket CLOB API adapter
- [ ] Email notification delivery
- [ ] 2FA with TOTP
- [ ] Mobile-responsive app layout
- [ ] Advanced charting with TradingView
- [ ] Strategy marketplace
- [ ] Team/organization support

---

**Disclaimer**: Trading prediction markets involves risk. Past performance does not guarantee future results. This platform provides tools for research and automation — it does not provide financial advice. Users are responsible for understanding the risks and legal requirements in their jurisdiction.
