# REQ-ENG: Engineering gates

## REQ-ENG-001

`npm run lint` exits 0.

## REQ-ENG-002

`npm run build` exits 0.

## REQ-ENG-003

`MODEL` defaults to `gpt-4o-mini` in `lib/config.ts`.

## REQ-ENG-004

Error boundaries: `app/error.tsx`, `app/global-error.tsx`, `app/not-found.tsx`.

## REQ-ENG-005

`.env.local` in `.gitignore`.

## Verification

- automated: `lint.sh`, `build.sh`, `config-budget.sh`
