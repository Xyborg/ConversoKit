# App-review checklist

Walk through before submitting your ChatGPT App for review.

## Identity & branding

- [ ] App name is unique, descriptive, and not infringing.
- [ ] Icon is square, 1024×1024, transparent background.
- [ ] Tagline is one sentence describing the user value.

## URLs

- [ ] **Privacy URL** is reachable and dated.
- [ ] **Terms URL** is reachable and dated.
- [ ] Support / contact URL works.
- [ ] Both URLs are passed to `<ConsentBanner privacyUrl termsUrl>`.

## Auth

- [ ] At least one auth path exists (anonymous, API key, JWT, or OAuth).
- [ ] Tools that mutate user-specific data set `permissions.requiresAuth: true`.
- [ ] OAuth providers (if used) have correct redirect URIs registered with the IdP.
- [ ] `COOKIE_SECRET` is rotated and not the default.

## Personal data (PRD §14)

- [ ] Every widget that collects personal data has `permissions.collectPersonalData: true` AND `requiresConsent: true`.
- [ ] Every consent-gated MCP tool has `permissions.requiresConsent: true`.
- [ ] `<ConsentBanner scopes={[...]}>` covers every scope you actually use.
- [ ] You don't collect: medical data, full financial credentials, government IDs, hidden background data.
- [ ] `GET /userdata/export` and `DELETE /userdata` return the user's data correctly.

## Data lifecycle

- [ ] Retention policy is documented (in code via `RetentionPolicy` and in your privacy URL).
- [ ] Stores are persistent (Supabase / Postgres / etc.) — not the default `InMemory*`.
- [ ] Webhooks (e.g. Stripe) record to a persistent `OrderStore`.
- [ ] You can answer "where is data X stored?" for every data type.

## Tool surface

- [ ] Every tool has a clear `description` (becomes ChatGPT's tool catalog text).
- [ ] Input/output schemas are tight (no `z.any()`).
- [ ] Errors return useful messages — not stack traces.
- [ ] Rate limits configured for any tool that hits a paid API.

## Security

- [ ] No secrets in committed code; `.env` is git-ignored.
- [ ] CORS origins are explicit (not `*`) in production.
- [ ] Stripe webhook signatures verified (default behavior — keep it).
- [ ] No `eval`, dynamic `Function`, or unsanitised HTML.
- [ ] Dependencies have no known critical CVEs (`pnpm audit`).

## Performance

- [ ] Widget UI bundle ≤ 200 KB gz.
- [ ] LCP < 2 s on the showcase page.
- [ ] No memory leaks (long-running dev session stable).

## Accessibility

- [ ] All interactive elements are keyboard-reachable.
- [ ] Forms have labels associated with inputs.
- [ ] Toasts / banners use `aria-live`.
- [ ] Color is not the only signal (status badges have text labels).

## Submission

- [ ] CHANGELOG (or release notes) describes what reviewers will see.
- [ ] Demo account / test data populated so reviewers can exercise tools.
- [ ] Read OpenAI Apps SDK reviewer guidelines once more.
