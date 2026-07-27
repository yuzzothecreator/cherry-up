# Cherry-Up (GrowthAI)

**Cherry-Up** is a production-ready SaaS platform — an AI-powered Instagram Growth Assistant that helps creators, brands, and businesses grow their Instagram presence through analytics, content intelligence, audience insights, and safe automation.

> Ethical growth only. No spam bots. No policy violations. User-approved actions with rate limiting and trust scoring.

## Architecture

```
Cherry-Up/
├── apps/
│   ├── web/           # Next.js 15 frontend (App Router, Tailwind, shadcn/ui, Framer Motion, Zustand)
│   ├── api/           # NestJS backend (JWT auth, Prisma, BullMQ, Redis)
│   └── ai-service/    # Python FastAPI (OpenAI, scikit-learn ML engine)
├── docker-compose.yml # PostgreSQL, Redis, all services
└── .env.example
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Zustand, Recharts |
| Backend | NestJS, TypeScript, PostgreSQL, Prisma ORM |
| AI Service | Python FastAPI, OpenAI API, scikit-learn |
| Infrastructure | Redis, BullMQ, Docker |

## Modules

1. **User Dashboard** — Followers, growth rate, engagement, content performance, audience insights, recommendations, account health score
2. **AI Content Assistant** — Captions, hashtags, idea analysis, Reel hooks, posting times, post performance analysis
3. **Content Analytics Engine** — Post tracking, content type comparison, topic analysis, reports
4. **Audience Intelligence** — ML scoring (interest relevance, engagement, account quality, niche similarity)
5. **Safe Automation** — Approval system, rate limiting, trust score, abuse prevention
6. **AI Recommendation Engine** — Content, timing, trending topics, engagement tips
7. **Competitor Analysis** — Public data analysis, engagement comparison, strategy reports
8. **Notification System** — Dashboard alerts, milestones, weekly reports
9. **Admin Panel** — User management, subscriptions, system analytics, AI usage monitoring

## Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Python 3.12+ (for local AI service)
- OpenAI API key (optional — demo mode works without it)

### 1. Clone & Configure

```bash
cp .env.example .env
# Edit .env with your secrets
```

### 2. Start Infrastructure

```bash
docker compose up -d postgres redis
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Setup Database

```bash
cd apps/api
npx prisma migrate dev --name init
npx prisma db seed
cd ../..
```

### 5. Run Development

```bash
# All services
npm run dev

# Or individually:
npm run dev:api    # http://localhost:3001
npm run dev:web    # http://localhost:3000
npm run dev:ai     # http://localhost:8001
```

### 6. Docker (Full Stack)

```bash
docker compose up --build
```

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@cherry-up.com | Admin123! |
| Demo User | demo@cherry-up.com | Demo123! |

## API Documentation

Once the API is running, visit: **http://localhost:3001/api/docs** (Swagger)

## Security

- JWT authentication with refresh tokens
- Role-based access control (USER, ADMIN, SUPER_ADMIN)
- Input validation (class-validator)
- API rate limiting (Throttler)
- AES-256-GCM encryption for sensitive tokens
- Audit logging for all critical actions
- Automation abuse prevention with trust scoring

## Testing

```bash
# API tests
cd apps/api && npm test

# AI service tests
cd apps/ai-service && python -m pytest
```

## Environment Variables

See `.env.example` for all configuration options.

## License

Proprietary — Cherry-Up © 2026
