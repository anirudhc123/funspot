# Funspot — PHASE 0 Architecture

Purpose: capture system design, monorepo layout, backend & frontend architecture, DB schema, infra, and security decisions to confirm before PHASE 1.

**1. System Architecture**
- Components: React Native (mobile), Next.js (web), Express API (central backend), PostgreSQL, Redis, BullMQ workers, Socket.IO, Object Storage (S3/Cloudinary), Email/Push provider, CDN.
- Flow: Clients -> Next.js (web SSR/SSG) & RN (mobile) -> Express API (/api/v1) -> services -> repos -> Prisma -> Postgres. Background jobs via BullMQ + Redis. Real-time via Socket.IO with Redis adapter. Media via signed uploads to S3.

**2. Architecture Diagram (Mermaid)**
```mermaid
flowchart LR
  subgraph Clients
    RN[React Native (Expo)]
    Web[Next.js (App Router)]
  end
  Clients -->|REST / GraphQL / Realtime| API[Express API (/api/v1)]
  API --> Postgres[(PostgreSQL + Prisma)]
  API --> Redis[(Redis)]
  API --> S3[(S3 / Object Storage)]
  API -->|enqueue| Bull[BullMQ / Redis]
  API -->|socket| Socket[Socket.IO]
  Bull --> Workers[Workers (processImage, sendEmail, generateThumb)]
  Socket --> Redis
  Workers --> Postgres
  Workers --> S3
```

**3. Monorepo Structure**
- social-platform/
  - apps/
    - api/ (Express backend, TypeScript, Prisma client)
    - web/ (Next.js App Router)
    - mobile/ (Expo + RN)
  - packages/
    - types/ (shared TypeScript types)
    - validation/ (Zod schemas)
    - api-client/ (generated client, e.g., OpenAPI or typed-fetch)
    - config/ (shared config helpers)
  - infra/ (docker-compose, k8s manifests, Terraform/Bicep)
  - scripts/ (dev scripts)
  - .github/ (CI)

Notes: Use pnpm workspaces (or yarn v3) — decision required in checklist.

**4. Backend Architecture**
- Layering: Route -> Middleware -> Controller -> Service -> Repository -> Prisma -> Postgres.
- Folder layout (`apps/api`):
  - src/
    - routes/ (versioned route definitions)
    - controllers/
    - services/
    - repositories/
    - validators/ (Zod)
    - middlewares/ (auth, errorHandler, rateLimit)
    - jobs/ (queue producers)
    - workers/ (queue processors)
    - sockets/ (Socket.IO handlers)
    - utils/, lib/
    - prisma/ (schema, client wrapper)
- Rules: services contain business logic; repositories only query DB; controllers orchestrate service calls and map responses.

**5. Frontend Architecture**
- Next.js (`apps/web`): App Router, server components for data fetching, client components for interactivity. TanStack Query for server state, React Hook Form + Zod for forms, Tailwind CSS.
- Expo RN (`apps/mobile`): Expo Router, client-side rendering, TanStack Query, React Hook Form + Zod.
- Shared UI & types in `packages/` when applicable (avoid shipping server-only code to client bundles).

**6. PostgreSQL Entity Relationship Design (high level)**
- Entities (primary fields only):
  - User(id PK uuid, email, passwordHash, isEmailVerified, createdAt, updatedAt)
  - Profile(id PK uuid, userId FK, username unique, displayName, bio, avatarUrl, createdAt, updatedAt)
  - Session(id PK uuid, userId FK, userAgent, ip, createdAt, expiresAt)
  - RefreshToken(id PK uuid, userId FK, tokenHash, revoked boolean, createdAt, replacedBy)
  - Post(id PK uuid, authorId FK, content text, visibility enum, createdAt, updatedAt)
  - PostMedia(id PK uuid, postId FK, url, mime, width, height, size, createdAt)
  - Comment(id PK uuid, postId FK, authorId FK, content, parentId FK nullable, createdAt)
  - Like(id PK uuid, targetType enum, targetId uuid, userId FK, createdAt) -- unique(userId,targetType,targetId)
  - Follow(id PK uuid, followerId, followeeId, status enum, createdAt)
  - Hashtag(id PK uuid, tag, createdAt)
  - PostHashtag(postId FK, hashtagId FK) composite PK
  - Mention(id PK uuid, postId FK, mentionedUserId FK)
  - Notification(id PK uuid, userId FK, type, payload jsonb, read boolean, createdAt)
  - Conversation(id PK uuid, createdAt)
  - ConversationMember(id PK uuid, conversationId FK, userId FK, joinedAt)
  - Message(id PK uuid, conversationId FK, senderId FK, content, createdAt)
  - Report(id PK uuid, reporterId FK, targetType, targetId, reason, status)
  - AuditLog(id PK uuid, actorId FK nullable, action, meta jsonb, createdAt)

- Indexing: index on username, email, createdAt for timeline queries, composite indexes for feed cursors (author+createdAt). Use cursor pagination on timeline queries.

Mermaid ER (simplified):
```mermaid
erDiagram
  USER ||--o{ PROFILE : "has"
  USER ||--o{ POST : "authors"
  POST ||--o{ POSTMEDIA : "has"
  POST ||--o{ COMMENT : "has"
  USER ||--o{ COMMENT : "authors"
  USER ||--o{ LIKE : "gives"
  POST ||--o{ LIKE : "receives"
  POST ||--o{ POSTHASHTAG : "links"
  HASHTAG ||--o{ POSTHASHTAG : "maps"
  CONVERSATION ||--o{ CONVERSATIONMEMBER : "has"
  CONVERSATION ||--o{ MESSAGE : "has"
  USER ||--o{ MESSAGE : "sends"
```

**7. Redis Architecture**
- Roles: caching (user profile cache, feed cache), rate limiting (per-IP, per-user), presence (online status), pub/sub for Socket.IO scaling, queue backing store for BullMQ.
- Namespaces / key patterns: `cache:user:{id}`, `presence:user:{id}`, `ratelimit:ip:{ip}`, `queue:{name}:job:{id}`.
- Eviction policies: use TTLs for caches, strong consistency comes from Postgres.

**8. Authentication Architecture**
- Flow: Access token (short lived, JWT or opaque) + Refresh token (rotating, stored server-side hashed). Use HTTP-only secure cookies for web; mobile uses secure storage.
- Sessions/Refresh tokens: persist in Postgres `sessions`/`refresh_tokens` table for revocation and device management.
- Passwords: bcrypt/argon2id hashing with proper work factor. No secrets in code.
- Endpoints: `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/verify-email`, `/auth/request-password-reset`, `/auth/reset-password`.
- CSRF: For cookie-based auth, implement CSRF protection (double submit or same-site cookies).
- RBAC: role field on User/Permission table; enforce in middleware.

**9. Media Upload Architecture**
- Signed upload flow: client requests signed URL -> API validates auth + metadata -> API issues presigned PUT (S3) or upload token (Cloudinary).
- Post-upload: client notifies API with upload result; API creates `PostMedia` record and enqueues `processImage`/`generateThumbnail` jobs.
- Validation: file type, size, and content scanning policy (virus/malware, optional). Thumbnails & transcoding in workers.
- Storage paths: use tenant/user-based prefixes and content-addressable naming to avoid collisions.

**10. Socket.IO Architecture**
- Use namespaces/rooms for: `notifications`, `chat:{conversationId}`, `presence`.
- Authentication: token passed during handshake (access token) validated by middleware.
- Scaling: Socket.IO Redis adapter for multi-instance scale; configure sticky sessions or use a message broker / gateway (e.g., socket gateway or cloud-managed WebSocket service).
- Events: `message:new`, `message:read`, `typing`, `notification:push`, `presence:update`.
- Persist critical events (messages) to Postgres; ephemeral presence in Redis.

**11. BullMQ Architecture**
- Queues: `media-processing`, `email`, `push-notifications`, `search-index`, `cleanup`, `analytics`.
- Workers: separated processes (Docker services) with concurrency controls and retries; use job-specific rate limits and priorities.
- Monitoring: Bull Board or Arena for visibility.
- Job idempotency: design jobs to be idempotent and persist job metadata where necessary.

**12. API Module Structure**
- Versioned API under `/api/v1`
- Modules (each as a folder): `auth`, `users`, `profiles`, `posts`, `comments`, `likes`, `follows`, `feed`, `notifications`, `chat`, `search`, `media`, `admin`.
- Each module: `routes.ts`, `controller.ts`, `service.ts`, `repository.ts`, `validators.ts`, `types.ts`.
- Global middlewares: auth, rateLimit, helmet, inputValidation, errorHandler.
- Response wrapper: centralized response format `{ success, data }` or `{ success: false, error: { code, message, details } }`.

**13. Development Phases**
- PHASE 0: Architecture & planning (this document).
- PHASE 1: Monorepo & tooling (workspaces, linters, Husky, codeowners).
- PHASE 2: Express backend foundation (project skeleton, health, logging).
- PHASE 3: PostgreSQL + Prisma (schema + migration tooling).
- PHASE 4: Authentication (register/login/refresh).
- PHASE 5: Users & profiles.
- PHASE 6: Posts & media (upload flow, storage).
- PHASE 7: Likes/comments/follows.
- PHASE 8: Feed & search.
- PHASE 9: Notifications.
- PHASE 10: Realtime chat.
- PHASE 11: React Native app.
- PHASE 12: Next.js web app.
- PHASE 13: Admin system.
- PHASE 14: Testing.
- PHASE 15: Security & performance.
- PHASE 16: Docker production setup.
- PHASE 17: CI/CD & deployment.

**14. Required Tools**
- Runtime: Node.js 18+.
- Package manager: pnpm (recommended) or yarn v3.
- Language: TypeScript (strict mode).
- DB: PostgreSQL 14+; Prisma as ORM.
- Cache/Queues: Redis; BullMQ.
- Realtime: Socket.IO.
- Storage: MinIO (dev) / AWS S3 / Cloudinary (prod).
- Dev: Docker & Docker Compose, pgAdmin/Adminer.
- Tests: Vitest/Jest, Supertest, React Testing Library, Playwright.
- Lint/format: ESLint, Prettier, TypeScript compiler.

**15. Environment Variable Plan**
- Common vars (root `.env` for local dev, secrets managed in prod):
  - NODE_ENV=development|production
  - DATABASE_URL=postgresql://user:pass@host:5432/db
  - DATABASE_URL_TEST (for CI)
  - REDIS_URL=redis://:password@host:6379
  - S3_ENDPOINT, S3_BUCKET, S3_REGION, S3_ACCESS_KEY, S3_SECRET_KEY
  - JWT_ACCESS_TOKEN_SECRET (or signing key), ACCESS_TOKEN_EXP
  - REFRESH_TOKEN_SIGNING_KEY, REFRESH_TOKEN_EXP
  - EMAIL_PROVIDER_DSN (SendGrid/Mailgun)
  - PUSH_PROVIDER_KEY
  - SOCKET_IO_ADAPTER_REDIS_URL
  - BULLMQ_PREFIX
  - SENTRY_DSN (optional)
- Naming: prefix env vars per app: `API_`, `WEB_`, `MOBILE_` where needed.
- Do not commit `.env` to repo; provide `.env.example` with required keys and placeholders.

**16. Docker Development Architecture**
- `docker-compose.yml` services:
  - postgres (volume), redis (volume)
  - minio (for S3-compatible dev storage)
  - api (bind-mounted src, hot-reload via ts-node-dev)
  - worker (runs BullMQ workers)
  - web (Next.js dev)
  - adminer (DB GUI)
- Networks: single overlay for inter-service comms. Volumes for Postgres & Redis.
- Healthchecks and wait-for-db scripts for container start order.

**17. Production Architecture**
- Option A (managed): use managed DB (RDS/Postgres), managed Redis (ElastiCache/Redis Cloud), S3, and container service (Azure App Service / AWS ECS / GCP Cloud Run / Azure Container Apps).
- Option B (Kubernetes): deploy API, workers, web as containers on K8s, with Ingress + autoscaling, Redis/managed cache, object storage, and separate job worker deployments.
- Socket scaling: use Redis adapter and either sticky session LB or a dedicated WebSocket gateway (e.g., AWS API Gateway WebSockets or socket cluster).
- CI/CD: GitHub Actions building images, running migrations (prisma migrate deploy), deploying manifests.
- Observability: Prometheus/Grafana or hosted monitoring, Sentry for errors, structured logs to ELK/Datadog.

**18. Security Architecture**
- Network: private DB subnets, restrict DB access to app services only.
- App: Helmet, input sanitization (Zod), CORS policies, rate limiting, brute-force protections.
- Auth: secure, HTTP-only cookies for web, SameSite=Lax/Strict, refresh token rotation and revocation.
- Secrets: use Vault/Cloud KMS/Secrets Manager; never commit secrets.
- Data: TLS in transit, at-rest encryption on DB and object storage, PII minimization.
- Access control: role-based access control and admin auditing (AuditLog).
- File uploads: validate MIME & size, scan uploads (optional), restrict executables.
- Logging: redact sensitive fields (passwords, tokens) before logging.

---

**Checklist — Decisions to Confirm Before PHASE 1**
- Package manager: `pnpm` vs `yarn` vs `npm`.
- Monorepo runner: `turbo`, `nx`, or plain pnpm workspaces.
- Object storage provider: `AWS S3`, `Cloudinary`, or self-hosted `MinIO` in prod.
- Token strategy: JWT access tokens vs opaque tokens + introspection.
- Access/refresh token lifetimes and rotation policy.
- Email provider (SendGrid, SES, Mailgun) and verification flow.
- Image/video processing service and acceptable codecs/resolutions.
- Deployment target: managed services vs Kubernetes.
- CDN choice and caching strategy for media.
- Authentication UX: email-only vs username + email vs social login.
- File size limits, allowed MIME types, moderation policy.
- RBAC granularity and admin roles.
- GDPR/data retention policy and soft-delete semantics.
- Monitoring & Sentry plan (which provider).
- Testing frameworks preference (Vitest vs Jest in backend/frontend).

Document created at: `d:/p/funspot/docs/PHASE_0_ARCHITECTURE.md`
