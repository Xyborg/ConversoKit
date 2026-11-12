FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
COPY . .
RUN pnpm install --frozen-lockfile && pnpm build
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -q -O - http://localhost:3000/health || exit 1
CMD ["node", "apps/mcp-server/dist/index.js"]
