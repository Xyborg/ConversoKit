# @conversokit/auth

Auth providers (API key, JWT/JWKS, Google/GitHub/Microsoft/Auth0 OAuth, Clerk, Supabase) and Express middleware for ConversoKit ChatGPT Apps.

Part of [ConversoKit](https://github.com/Xyborg/ConversoKit) — a boilerplate for building ChatGPT Apps (Apps SDK / MCP) in <30 minutes.

## Install

```bash
pnpm add @conversokit/auth express
# or
npm install @conversokit/auth express
```

## Usage

```ts
import express from 'express';
import {
  createAuthMiddleware,
  apiKeyProvider,
  bearerJwtProvider,
} from '@conversokit/auth';

const app = express();

app.use(
  createAuthMiddleware({
    providers: [
      apiKeyProvider({ keys: process.env.API_KEYS!.split(',') }),
      bearerJwtProvider({ jwksUri: process.env.JWKS_URI! }),
    ],
    optional: false,
  }),
);
```

Providers chain and short-circuit on first success. The middleware sets `req.conversokitAuth` for downstream handlers. OAuth flow providers (`GoogleOAuthProvider`, `GitHubOAuthProvider`, etc.) drive `/auth/:provider/login|callback`.

## Documentation

Full docs and runnable examples live in the [main repo](https://github.com/Xyborg/ConversoKit#readme).

## License

Apache-2.0 © Martín Aberastegue
