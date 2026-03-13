---
name: tech-stack
description: Zentinel project technology stack overview.
activation: Always On
---

# Technology Stack: Zentinel

Zentinel is a monorepo-based project for automated changelog generation.

## Monorepo Structure
- **Tool**: NPM Workspaces.
- **Root**: `package.json` defines `apps/*`.
- **Apps**:
  - `apps/backend`: Express + TypeScript server.
  - `apps/frontend`: Vite + React + TypeScript client.

## Backend Core
- **Framework**: Express 5.
- **Language**: TypeScript (ESM).
- **AI Services**: Ollama (local) and OpenRouter (API).
- **ORM**: Drizzle ORM.
- **Database**: SQLite (via `better-sqlite3`).

## Frontend Core
- **Framework**: React 19.
- **Styling**: Vanilla CSS (Luxe System). No Tailwind.
- **Icons**: Lucide React.
- **API Client**: Axios.

## Common Configs
- **TSConfig**: Defined per app.
- **Drizzle**: `drizzle.config.ts` in backend.
