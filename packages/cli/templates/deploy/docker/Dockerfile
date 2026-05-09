# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

FROM base AS deps
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml turbo.json ./
COPY apps/mcp-server/package.json ./apps/mcp-server/
COPY packages ./packages
RUN pnpm install --frozen-lockfile --prod=false

FROM deps AS build
COPY . .
RUN pnpm -w build

FROM base AS runtime
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages
COPY --from=build /app/apps/mcp-server/dist ./apps/mcp-server/dist
COPY --from=build /app/apps/mcp-server/package.json ./apps/mcp-server/
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -q -O - http://localhost:3000/health || exit 1
CMD ["node", "apps/mcp-server/dist/index.js"]
