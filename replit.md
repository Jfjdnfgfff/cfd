# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### Gold Nutrition Rouiba (`artifacts/gold-nutrition`) — Preview: `/`
- Dark athletic supplement store with Black/Gold/White theme
- React + Vite + Tailwind CSS
- **Store page (`/`)**: product grid, category filter, search, sidebar cart, WhatsApp checkout
- **Admin page (`/admin`)**: add/edit/delete products via localStorage
- **Cart**: quantity control, customer info form, WhatsApp order to `0549195666`
- **Contact**: phones `0549195666` / `0557113327`, Facebook, Google Maps
- **Data**: localStorage-based (no backend needed)

### API Server (`artifacts/api-server`) — Preview: `/api`
- Express 5 API server (backend)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/gold-nutrition run dev` — run store locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
