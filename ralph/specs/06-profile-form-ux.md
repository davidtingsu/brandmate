# REQ-PROFILE: Profile form UX

## REQ-CREATE-010

Profile form disappears after submit.

- AC1: `ProfileForm` when `saved` renders only `BrandProfileCard` (no form fields)
- AC2: HITL path uses same collapse behavior

## REQ-CREATE-011

BrandProfileCard then GeneratePostForm.

- AC1: Profile onboarding at `/onboard`; studio post step shows `BrandProfileCard` above `GeneratePostForm`
- AC2: `BrandProfileCard` above `GeneratePostForm` on studio post step
- AC3: Continue to preview and attempt cards remain on step 2

## Verification

- automated: `profile-form-collapse.sh`
- scope: `--scope profile`
