# Funspot

Funspot is a social platform monorepo designed around a modular backend, a mobile app, and a web app. The project follows a clean layered architecture with versioned APIs, shared packages, and a clear roadmap for phased feature delivery.

## Overview

This repository is organized as a multi-package workspace:

- `apps/api` — Express + TypeScript backend
- `apps/web` — Next.js web client
- `apps/mobile` — React Native / Expo client
- `packages/types` — shared TypeScript models and contracts
- `packages/validation` — schema and validation helpers
- `packages/config` — shared configuration utilities
- `packages/api-client` — typed API client layer

The product architecture is designed for social features such as profiles, posts, media uploads, notifications, messaging, and admin tooling, with the backend exposed under the `/api/v1` route namespace.

## Tech Stack

### Backend
- Node.js
- Express
- TypeScript
- Zod
- Helmet
- CORS
- Express rate limiting
- Structured logging
- Centralized error handling

### Frontend
- Next.js (web)
- React Native / Expo (mobile)

### Infrastructure
- PostgreSQL
- Redis
- Docker / Docker Compose
- Monorepo workspace management with npm or pnpm workspaces

## Project Goals

- Build a scalable social platform foundation
- Keep backend modules organized by responsibility
- Standardize response contracts and validation
- Prepare for safe future authentication and business feature work
- Enforce secure defaults from the start (helmet, CORS, rate limiting, request IDs, structured logs)

## Current Status

This repository is currently in Phase 6: posts and media.

Implemented so far:
- Express application startup
- Environment configuration
- Versioned API router at `/api/v1`
- Health endpoint: `GET /api/v1/health`
- Centralized error handler
- 404 handler
- Request logging
- Request ID middleware
- Security middleware stack
- CORS configuration
- Rate limiting
- Zod validation infrastructure
- Standardized API response format
- Prisma schema covering users, profiles, sessions, posts, social interactions, notifications, conversations, messages, reports, and audit logs
- PostgreSQL database module with Prisma client lifecycle management
- Initial Prisma migration under `apps/api/prisma/migrations/`
- Database health endpoint: `GET /api/v1/health/db`
- Authentication module wired under `/api/v1/auth` with register, login, logout, refresh, forgot-password, reset-password, password reset architecture, and secure cookie-compatible token responses
- Password hashing via bcryptjs and JWT access/refresh token issuance with a secure-cookie and bearer-token friendly strategy
- Protected route middleware prototype via `requireAuth`
- Users module route, controller, service, repository, and validator scaffolding for `GET /api/v1/users/me`, `PATCH /api/v1/users/me`, `GET /api/v1/users/:username`, follow, unfollow, accept/reject/cancel follow requests, followers, following, block/unblock, mute/unmute
- Posts module for create, read, update, and delete with privacy levels (`PUBLIC`, `FOLLOWERS`, `PRIVATE`), hashtags, mentions, media metadata, validation, and ownership enforcement
- Media upload architecture for signed upload URL generation, file type/size validation, and object storage metadata preparation
- BullMQ-ready worker definitions for image processing, video processing, and thumbnail generation

The repository now includes the Phase 4 auth base, the Phase 5 user profile foundation, and the Phase 6 post/media workflow using in-memory repositories for the current implementation stage while preserving a clear path to Prisma-backed persistence later.

## Repository Structure

```text
funspot/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── config/
│   │   │   ├── controllers/
│   │   │   ├── errors/
│   │   │   ├── middleware/
│   │   │   ├── modules/
│   │   │   ├── repositories/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   ├── utils/
│   │   │   ├── validators/
│   │   │   ├── app.ts
│   │   │   └── index.ts
│   │   ├── .env.example
│   │   ├── prisma/
│   │   │   ├── migrations/
│   │   │   └── schema.prisma
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── web/
│   └── mobile/
├── packages/
│   ├── api-client/
│   ├── config/
│   ├── types/
│   └── validation/
├── docs/
├── .env.example
├── .gitignore
├── .prettierrc
├── .prettierignore
├── docker-compose.yml
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── README.md
```

## Local Development

### Prerequisites
- Node.js 18+
- npm or pnpm
- Docker (for Postgres/Redis if you want local infra)

### Install dependencies

```bash
npm install
```

or, if using pnpm:

```bash
pnpm install
```

### Run the API

```bash
cd apps/api
npm run dev
```

The backend will start and expose the API on:

```text
http://localhost:4000
```

### Health check

```bash
curl http://localhost:4000/api/v1/health
```

Expected response:

```json
{
  "success": true,
  "data": {
    "status": "ok"
  }
}
```

### Database setup and health check

Start the local PostgreSQL service with Docker Compose, then configure `apps/api/.env` from `apps/api/.env.example`.

```bash
docker compose up -d postgres
cd apps/api
npm run db:generate
npm run db:deploy
curl http://localhost:4000/api/v1/health/db
```

The database health endpoint executes a lightweight PostgreSQL query and returns the standard success response when the connection is available.

## API Design

The application exposes versioned endpoints under `/api/v1` and uses a consistent response contract:

Success response:

```json
{
  "success": true,
  "data": { ... }
}
```

Error response:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": { ... }
  }
}
```

## Security Defaults

The foundation already includes:
- Helmet for secure HTTP headers
- CORS configuration
- Rate limiting
- Request ID tracking
- Structured logging
- Centralized error handling

## Roadmap

The project is planned in phases:

1. Phase 0 — Architecture and planning
2. Phase 1 — Monorepo tooling
3. Phase 2 — Express backend foundation
4. Phase 3 — PostgreSQL + Prisma
5. Phase 4 — Authentication
6. Phase 5 — Users and profiles
7. Phase 6 — Posts and media
8. Phase 7 — Likes, comments, follows
9. Phase 8 — Feed and search
10. Phase 9 — Notifications
11. Phase 10 — Realtime chat
12. Phase 11 — Mobile app
13. Phase 12 — Web app
14. Phase 13 — Admin system
15. Phase 14 — Testing
16. Phase 15 — Security and performance
17. Phase 16 — Production Docker setup
18. Phase 17 — CI/CD and deployment

## Contributing

This project is intended to evolve with clear module boundaries and disciplined engineering practices.

- Keep business logic in services
- Keep database logic in repositories
- Keep route definitions versioned and modular
- Validate all user input with Zod
- Centralize errors and response shaping
- Do not mix auth or business modules into the base API foundation

## License

This project is currently under active development and does not yet declare a production license.

## Notes

The foundation is intentionally minimal and intentionally avoids authentication and feature-specific modules until the underlying infrastructure is stable. This keeps the project easy to extend while staying aligned with the architecture blueprint.
