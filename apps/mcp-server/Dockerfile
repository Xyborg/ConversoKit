FROM node:20-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/mcp-server/package.json apps/mcp-server/
COPY packages packages
RUN pnpm install --frozen-lockfile

FROM node:20-alpine AS build
WORKDIR /app
RUN corepack enable
COPY --from=deps /app /app
COPY apps/mcp-server apps/mcp-server
RUN pnpm --filter mcp-server build

FROM node:20-alpine AS runtime
WORKDIR /app
RUN corepack enable && apk add --no-cache tini
ENV NODE_ENV=production
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/packages /app/packages
COPY --from=build /app/apps/mcp-server/dist /app/apps/mcp-server/dist
COPY --from=build /app/apps/mcp-server/package.json /app/apps/mcp-server/package.json
EXPOSE 3000
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "apps/mcp-server/dist/index.js"]
