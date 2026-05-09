FROM node:20-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/widget-ui/package.json apps/widget-ui/
COPY packages packages
RUN pnpm install --frozen-lockfile

FROM node:20-alpine AS build
WORKDIR /app
RUN corepack enable
COPY --from=deps /app /app
COPY apps/widget-ui apps/widget-ui
RUN pnpm --filter widget-ui build

FROM nginx:alpine AS runtime
COPY --from=build /app/apps/widget-ui/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
