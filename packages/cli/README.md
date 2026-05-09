# conversokit

CLI for ConversoKit — scaffold ChatGPT Apps in <30 minutes. Includes `create`, `add`, and `deploy` commands.

Part of [ConversoKit](https://github.com/Xyborg/ConversoKit) — a boilerplate for building ChatGPT Apps (Apps SDK / MCP) in <30 minutes.

## Install

You don't need to install — just run via `npx`:

```bash
npx conversokit create my-app --template commerce
```

Or install globally:

```bash
pnpm add -g conversokit
# or
npm install -g conversokit
```

## Usage

```bash
# Scaffold a new app from a template
npx conversokit create my-shop --template commerce

# Add a widget, integration, or template to an existing project
npx conversokit add widget ProductCard
npx conversokit add integration stripe
npx conversokit add template booking

# Generate deploy configs
npx conversokit deploy vercel
npx conversokit deploy docker
npx conversokit deploy railway
```

Templates: `commerce`, `booking`, `saas-onboarding`, `travel`, `dashboard`. Each scaffold pulls `@conversokit/*` packages from npm by semver.

## Documentation

Full docs and runnable examples live in the [main repo](https://github.com/Xyborg/ConversoKit#readme).

## License

Apache-2.0 © Martín Aberastegue
