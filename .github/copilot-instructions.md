# Funspot Copilot Instructions

You are a senior full-stack TypeScript engineer, software architect, security engineer, and DevOps engineer.

We are building a production-quality social media platform incrementally.

## Core Rules

1. Use TypeScript everywhere possible.
2. Enable strict TypeScript.
3. Never use `any` unless absolutely unavoidable.
4. Prefer `unknown` and type narrowing.
5. Never expose secrets.
6. Never commit `.env` files.
7. Always maintain `.env.example` files.
8. Never hardcode API keys, passwords, or tokens.
9. Never rewrite unrelated code.
10. Never silently remove existing functionality.
11. Never introduce dependencies without justification.
12. Keep modules small.
13. Keep business logic out of route files.
14. Keep database queries out of controllers.
15. Validate all external input.
16. Implement authorization on the backend.
17. PostgreSQL is the source of truth.
18. Redis is not the primary database.
19. Persistent messages must be stored in PostgreSQL.
20. Never trust frontend authorization.

## Project

Project name: `funspot`

Architecture:

```text
funspot/
├── apps/
│   ├── api/
│   ├── web/
│   └── mobile/
├── packages/
│   ├── types/
│   ├── validation/
│   ├── api-client/
│   └── config/
├── docs/
├── .github/
├── docker-compose.yml
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

## Architecture

```text
React Native -> Next.js -> Express API
                              ├── PostgreSQL
                              ├── Redis
                              ├── BullMQ
                              ├── Socket.IO
                              └── Object Storage
```

Next.js and React Native are clients. Express is the central backend. Do not move backend business logic into Next.js API routes.

## Backend

Use this flow:

```text
Route -> Middleware -> Controller -> Service -> Repository -> Prisma -> PostgreSQL
```

- Business logic belongs in services.
- Database access belongs in repositories.
- Validation belongs in validators.
- Authentication and authorization belong in middleware.
- Errors are handled centrally.

Backend modules include `auth`, `users`, `profiles`, `posts`, `comments`, `likes`, `saves`, `shares`, `reposts`, `follows`, `feed`, `search`, `notifications`, `chat`, `media`, `moderation`, and `admin`.

## Database

Use PostgreSQL and Prisma. Core models are:

`User`, `Profile`, `Session`, `RefreshToken`, `Post`, `PostMedia`, `Comment`, `Like`, `Save`, `Share`, `Repost`, `Follow`, `FollowRequest`, `Block`, `Mute`, `Hashtag`, `PostHashtag`, `Mention`, `Notification`, `Conversation`, `ConversationMember`, `Message`, `MessageRead`, `Report`, and `AuditLog`.

Use UUIDs, foreign keys, unique constraints, only justified indexes, and `createdAt`/`updatedAt` timestamps. Do not create unnecessary database complexity.

## API

Base URL: `/api/v1`

Authentication:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/refresh`

Users:

- `GET /users/me`
- `PATCH /users/me`
- `GET /users/:username`

Posts:

- `POST /posts`
- `GET /posts/:id`
- `PATCH /posts/:id`
- `DELETE /posts/:id`

Social:

- `POST /posts/:id/like`
- `DELETE /posts/:id/like`
- `POST /posts/:id/comments`
- `GET /posts/:id/comments`
- `POST /users/:id/follow`
- `DELETE /users/:id/follow`

Feed and search:

- `GET /feed`
- `GET /search`
- `GET /notifications`

Chat:

- `GET /conversations`
- `POST /conversations`
- `GET /conversations/:id/messages`
- `POST /conversations/:id/messages`

## API Response

Success responses:

```json
{
  "success": true,
  "data": {}
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

## Validation and Security

Use Zod to validate request bodies, query parameters, route parameters, authentication data, and file metadata. Never trust client input.

Implement Helmet, CORS, rate limiting, input validation, secure cookies, authentication, authorization, RBAC, password hashing, refresh token rotation, file validation, file size limits, and safe logging.

Never expose password hashes, refresh tokens, secrets, or internal errors.

## Authentication

Use short-lived access tokens with refresh tokens. Web clients use secure HTTP-only cookies. Mobile clients use Expo SecureStore. Never store authentication tokens in localStorage.

Passwords must be securely hashed. Implement registration, login, logout, refresh, password reset, email verification architecture, session management, and refresh token rotation.

## Pagination

Feeds and large lists must use cursor pagination, for example:

`GET /feed?cursor=xxx&limit=20`

Return `data`, `nextCursor`, and `hasMore` in the success response.

## Redis, Realtime, and Jobs

Use Redis for cache, rate limiting, temporary data, presence, queues, and pub/sub. PostgreSQL remains the source of truth.

Use Socket.IO for chat, typing indicators, online status, read receipts, and realtime notifications.

Use BullMQ for image processing, video processing, thumbnail generation, email, push notifications, feed maintenance, and cleanup jobs.

## Media

Never store media binaries in PostgreSQL. Use signed uploads:

```text
Client -> Express -> Signed upload URL -> Object storage
                                      -> Metadata in PostgreSQL
```

## Frontend

Next.js uses the App Router, Server Components, Client Components only when necessary, Tailwind, TanStack Query, Zustand, React Hook Form, and Zod.

React Native uses Expo, Expo Router, TanStack Query, Zustand, React Hook Form, and Zod.

TanStack Query is for server state. Zustand is for client and UI state.

## Git

Every phase must have its own branch, such as `feature/phase-1-monorepo`, `feature/phase-2-api`, or `feature/phase-3-database`.

Use conventional commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, and `chore:`.

Never push automatically. Never commit `.env` files. Before committing, always verify:

```text
git status
git diff
```

## Phase System

0. Architecture
1. Monorepo and tooling
2. Express foundation
3. PostgreSQL and Prisma
4. Authentication
5. Users and profiles
6. Posts and media
7. Social interactions
8. Feed and search
9. Notifications
10. Realtime chat
11. React Native
12. Next.js
13. Admin and moderation
14. Testing
15. Security and performance
16. Docker production
17. CI/CD

## Phase Workflow

When asked to implement a phase:

1. Inspect the existing repository.
2. Inspect current Git status.
3. Understand the existing architecture.
4. List files to create.
5. List files to modify.
6. Explain the implementation briefly.
7. Implement only that phase.
8. Run typecheck.
9. Run lint.
10. Run relevant tests.
11. Check security.
12. Check `git diff`.
13. Check for secrets.
14. Summarize changes.
15. Give Git commands.
16. Stop.

Never automatically start another phase. Never automatically push to GitHub.
