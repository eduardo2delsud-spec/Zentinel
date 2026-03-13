---
name: coding-style
description: Coding style and architectural patterns for Zentinel.
activation: Always On
---

# Coding Style and Patterns

## Monorepo Workflow
- Always specify which app matches the task (backend or frontend).
- Use `npm -w [package] [command]` to run commands from the root if necessary.

## Backend Patterns
- **Services**: All business logic (AI calls, DB inserts) must live in `src/services` or specialized directories like `src/db`.
- **Interfaces**: Use TypeScript interfaces for services (see `ai.interface.ts`).
- **Persistence**: Every generated report must be indexed in the SQLite database using Drizzle.

## Frontend Patterns
- **Styling**: DO NOT use Tailwind CSS. Use `index.css` with CSS Variables and standard CSS classes.
- **Components**: Functional components with Hooks.
- **State**: Use `useState` for UI state and `useEffect` for data fetching.

## General Rules
- **Naming**: 
  - Files: `camelCase`.
  - Folders: `camelCase` (except standard app folders).
- **Imports**: Use relative imports with `.js` extensions as required by `NodeNext`.
- **Typing**: Strict TypeScript. Avoid `any`.
