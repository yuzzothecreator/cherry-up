# Cherry-Up Architecture

## System Overview

Cherry-Up follows a **modular monorepo** architecture with three independent services communicating via REST APIs.

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (Browser)                        │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTPS
┌─────────────────────────▼───────────────────────────────────┐
│              Next.js 15 Frontend (port 3000)                │
│  App Router │ Zustand │ shadcn/ui │ Framer Motion          │
└─────────────────────────┬───────────────────────────────────┘
                          │ REST API
┌─────────────────────────▼───────────────────────────────────┐
│              NestJS API Gateway (port 3001)                 │
│  Auth │ RBAC │ Rate Limiting │ Validation │ Audit Log       │
├──────────┬──────────┬──────────┬──────────┬─────────────────┤
│Dashboard │ Content  │Analytics │ Audience │ Automation      │
│Recommend │Competitor│ Notif.   │ Admin    │ Social Accounts │
└────┬─────┴────┬─────┴────┬─────┴────┬─────┴────┬────────────┘
     │          │          │          │          │
     ▼          ▼          ▼          ▼          ▼
┌─────────┐ ┌────────┐ ┌───────┐ ┌────────┐ ┌──────────┐
│PostgreSQL│ │ Redis  │ │BullMQ │ │FastAPI │ │ OpenAI   │
│ (Prisma) │ │(Cache) │ │Workers│ │AI Svc  │ │   API    │
└─────────┘ └────────┘ └───────┘ └────────┘ └──────────┘
```

## Database Schema

11 core models + AccountHealth:

- **User** — Authentication, roles, profile
- **Profile** — User preferences, timezone
- **SocialAccount** — Instagram connection (encrypted tokens)
- **Post** — Content with engagement metrics
- **ContentAnalysis** — AI analysis per post
- **AudienceInsight** — ML audience scoring
- **Recommendation** — AI growth recommendations
- **AnalyticsReport** — Generated reports
- **Notification** — Multi-channel notifications
- **Subscription** — Plan management
- **AIUsage** — Token/cost tracking
- **AuditLog** — Security audit trail
- **AutomationAction** — Safe automation queue
- **Competitor** — Tracked competitors
- **AccountHealth** — Health score breakdown

## Authentication Flow

1. User registers/logs in → bcrypt password hash
2. JWT access token (7d) + refresh token (30d) issued
3. Global JwtAuthGuard validates all routes (except @Public)
4. RolesGuard enforces RBAC on admin routes
5. All auth events logged to AuditLog

## Safe Automation Pipeline

```
User Request → Validation → Rate Limit Check → Trust Score Check
    → Create Action (PENDING_APPROVAL) → User Approves/Rejects
    → BullMQ Queue → Worker Executes → Notification Sent
```

**Blocked actions:** mass_follow, mass_unfollow, mass_dm, spam_comment, bot_like

## AI Service Architecture

- **OpenAI Integration** — Content generation, analysis, competitor insights
- **ML Engine (scikit-learn)** — Audience scoring, content recommendations
- **Fallback Mode** — Works without API key for demo/development

## Deployment

Docker Compose orchestrates all services with health checks on PostgreSQL and Redis. Each service has its own Dockerfile with multi-stage builds for production optimization.
