FROM node:20-alpine AS build

WORKDIR /workspace
COPY package.json package-lock.json pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/api-client/package.json packages/api-client/package.json
COPY packages/config/package.json packages/config/package.json
COPY packages/types/package.json packages/types/package.json
COPY packages/validation/package.json packages/validation/package.json
RUN npm ci

COPY apps/api apps/api
RUN npm run db:generate --workspace @funspot/api
RUN npm run build --workspace @funspot/api

FROM node:20-alpine AS runtime

ENV NODE_ENV=production
WORKDIR /app

COPY --from=build /workspace/node_modules ./node_modules
COPY --from=build /workspace/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /workspace/apps/api/dist ./dist
COPY --from=build /workspace/apps/api/prisma ./prisma
COPY --from=build /workspace/apps/api/package.json ./package.json

USER node
EXPOSE 4000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
