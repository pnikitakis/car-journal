# Steering — Structure
app/
  (routes)
src/
  components/
  lib/          # storage.ts, filters.ts, csv.ts
  types/        # event.ts, vehicle.ts, settings.ts
tests/
- Place unit tests next to utils or under tests/.
- Name: kebab-case; React components PascalCase; hooks use `useX`.
- Keep functions small; prefer pure utilities for filter/search/parse.
