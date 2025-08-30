Car Journal Monorepo

![CI](https://github.com/pnikitakis/car-journal/actions/workflows/ci.yml/badge.svg?branch=main)

Workspace using pnpm with a Next.js app and a shared types package.

Getting Started

- Install pnpm: npm i -g pnpm
- Install deps: pnpm install
- Run dev (web): pnpm --filter @car-journal/web dev
- Typecheck all: pnpm typecheck
- Lint all: pnpm lint
- Test all: pnpm test
- Build all: pnpm -w build

Packages

- apps/web: Next.js App Router + TypeScript + Tailwind
- packages/types: Shared TypeScript types + Vitest tests

CI

- Workflow: `.github/workflows/ci.yml`
- Runs on PRs: `pnpm typecheck`, `pnpm lint`, `pnpm test -- --run`, `pnpm -w build`
- Actions: https://github.com/pnikitakis/car-journal/actions
