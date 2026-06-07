# REQ-ONBOARD: Profile onboarding gate

## REQ-ONBOARD-001

Dedicated `/onboard` route with ProfileForm before app access.

- AC1: `app/onboard/page.tsx` + `OnboardPage` with `data-testid="onboard-page"`
- AC2: Welcome copy and full ProfileForm (not compact)

## REQ-ONBOARD-002

Middleware cookie gate for whole-app onboarding.

- AC1: `middleware.ts` redirects to `/onboard` without `brandmate_onboarded` cookie
- AC2: `/onboard` allowed without cookie; `/onboard` redirects to `/` when cookie present (unless `?edit=1`)

## REQ-ONBOARD-003

Post studio is 2-step (Create post → Preview); no brand step in `/create`.

- AC1: `STUDIO_STAGE_ORDER` in `lib/create-flow/stages.ts`
- AC2: No `ProfileForm` in `GuidedStepInline` brand branch

## REQ-ONBOARD-004

Profile persisted in localStorage + onboard cookie on submit.

- AC1: `lib/brand-profile-storage.ts` with `PROFILE_STORAGE_KEY`
- AC2: `BrandProfileContext` hydrates from storage

## Verification

- automated: `onboarding-gate.sh`, `onboard-flow.spec.ts`
- scope: `--scope all`
