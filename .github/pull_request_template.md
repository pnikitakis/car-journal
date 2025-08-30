## Summary

Scaffold Next.js App Router app under `apps/web` with TypeScript and Tailwind, plus a shared `packages/types` workspace and Vitest with one passing test.

## How to run locally

- Install pnpm: `npm i -g pnpm`
- Install deps: `pnpm install`
- Dev server: `pnpm --filter @car-journal/web dev`
- Checks: `pnpm typecheck && pnpm lint && pnpm test`
- Build: `pnpm -w build`

## Outputs from CI / local run

Paste the outputs from the commands below. You can auto-capture on Windows by running `./scripts/capture-outputs.ps1` at the repo root; it writes to `pr-description.md`.

```text
(paste: pnpm typecheck)
(paste: pnpm lint)
(paste: pnpm test)
(paste: pnpm -w build)
```

