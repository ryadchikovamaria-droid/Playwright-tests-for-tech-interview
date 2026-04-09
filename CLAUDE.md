# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a monorepo of tech interview projects demonstrating full-stack development across multiple technology stacks. It contains three independent applications, each with a frontend and one or more backend options:

| Project | Frontend | Backend(s) |
|---------|----------|------------|
| Auction system | `auction-client/` (Next.js 14) | `auction_api/` (Elixir/Phoenix), `auction_api_rb/` (Rails 7.1) |
| Events feed | `events-app/` (Next.js 12) | `events_api/` (Elixir/Phoenix) |
| Timezone tracker | `timezone-app/` (Next.js 13) | — (client-only, localStorage) |

## Commands

### Next.js frontends (`auction-client/`, `events-app/`, `timezone-app/`)

```bash
npm run dev       # Development server
npm run build     # Production build
npm run lint      # ESLint
npm run e2e       # Playwright tests (timezone-app only)
```

### Elixir/Phoenix APIs (`auction_api/`, `events_api/`)

```bash
mix setup           # Install deps + create/migrate DB
mix phx.server      # Start server (localhost:4000)
mix test            # Run tests
mix test test/path/to/file_test.exs  # Run single test file
iex -S mix phx.server  # Interactive server
mix ecto.reset      # Drop and recreate DB
```

### Ruby on Rails (`auction_api_rb/`)

```bash
bundle install      # Install dependencies
rails server        # Start development server
rails db:setup      # Create and seed DB
rails test          # Run tests
```

## Architecture

### Frontend pattern
All frontends use **Next.js + TypeScript + Tailwind CSS**. The `events-app` and `auction-client` use **Apollo Client** for GraphQL queries. `timezone-app` is self-contained with no backend, persisting data to `localStorage`.

### GraphQL API pattern (Elixir)
Both Elixir APIs use **Absinthe** for GraphQL with **Ecto + PostgreSQL**. The schema is defined in `lib/<app>_web/schema.ex`, resolvers in `lib/<app>/`, and data models under `lib/<app>/`. CORS is enabled for cross-origin frontend requests.

### GraphQL API pattern (Rails)
`auction_api_rb` uses the **rails-graphql** gem with a modular structure under `app/graphql/` (queries, mutations, objects, enums, inputs, scalars). Uses SQLite for development. Docker-ready.

### Events API data model
The `events_api` `Event` schema tracks marketplace activity with fields: `actor`, `event_type`, `message`, `object`, `occurred_at`, `target`. Event types: `new_listing`, `modify_listing`, `withdraw_listing`, `new_bid`, `accept_bid`, `reject_bid`.

### API endpoints
- `events-app` is pre-configured to hit the deployed API at `https://events-api.fly.dev/api`
- `auction-client` is a stub UI pending integration with one of the auction backends
