# @conversokit/templates

App templates (commerce, booking, saas-onboarding, travel, dashboard) declaring tools, widgets, integrations, auth, and consent for ConversoKit.

Part of [ConversoKit](https://github.com/Xyborg/ConversoKit) — a boilerplate for building ChatGPT Apps (Apps SDK / MCP) in <30 minutes.

## Install

```bash
pnpm add @conversokit/templates
# or
npm install @conversokit/templates
```

## Usage

```ts
import { createCommerceTemplate } from '@conversokit/templates';

const template = createCommerceTemplate();
// template.tools     → ['search_products', 'add_to_cart', 'checkout', ...]
// template.widgets   → ['ProductCard', 'AddToCartPanel', ...]
// template.integrations → ['stripe', 'hubspot']
// template.auth.providers, template.compliance.consentScopes
```

Templates reference tools, widgets, and integrations **by string name**, not by import — keeping the template/server boundary loose. The `conversokit` CLI uses the same names when scaffolding.

## Documentation

Full docs and runnable examples live in the [main repo](https://github.com/Xyborg/ConversoKit#readme).

## License

Apache-2.0 © Martín Aberastegue
