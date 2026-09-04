# Phase 16: Production Docker

## Development

Create a local `.env` file with `POSTGRES_PASSWORD` before starting the dependencies.

Run the existing development dependencies with:

```bash
docker compose up -d postgres redis
```

Copy the environment example to a local `.env` file and run the workspaces with the package manager.

## Production

1. Copy `.env.production.example` to `.env.production`.
2. Replace every placeholder secret. Do not commit the file.
3. Build and start all services:

```bash
docker compose --env-file .env.production -f docker-compose.production.yml up -d --build
```

The stack contains API, Next.js web, PostgreSQL, Redis, and the BullMQ worker. PostgreSQL and Redis use named persistent volumes. API and web health checks gate dependent services.

Useful commands:

```bash
docker compose --env-file .env.production -f docker-compose.production.yml ps
docker compose --env-file .env.production -f docker-compose.production.yml logs -f api worker
docker compose --env-file .env.production -f docker-compose.production.yml down
```

Secrets are supplied through environment variables and are never stored in Dockerfiles.
