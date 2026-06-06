# BrandMate

Your LinkedIn brand coach that learns from every draft.

## Environment files

BrandMate uses **two separate env files**. Do not merge them.

| File | Purpose | Committed? | `REDIS_URL` |
|------|---------|------------|-------------|
| `.env.local` | Local `npm run dev` | No | `redis://localhost:6379` (Docker) |
| `.env.vercel` | Push secrets to Vercel | No | `rediss://...` (Redis Cloud) |
| `.env.local.example` | Local template | Yes | localhost placeholder |
| `.env.vercel.example` | Vercel template | Yes | Redis Cloud placeholder |

API keys (`OPENAI_API_KEY`, `WANDB_API_KEY`, `WEAVE_PROJECT`) can be the same in both files. **Only `REDIS_URL` differs** — localhost for dev, Redis Cloud for production.

## Local development

```bash
cp .env.local.example .env.local
# Edit .env.local with your keys

docker compose up -d   # local Redis Stack (after app scaffold)
npm run dev
```

## Vercel — manual push from `.env.vercel`

```bash
# 1. Create production env file (once)
cp .env.vercel.example .env.vercel

# 2. Edit .env.vercel — use Redis Cloud rediss:// URL + your keys

# 3. Install and link Vercel CLI (once)
npm install -g vercel
vercel login
vercel link

# 4. Push all vars to Vercel
npm run env:push-vercel

# 5. Deploy
vercel --prod
```

Preview environment:

```bash
npm run env:push-vercel:preview
```

Without global Vercel CLI:

```bash
npx vercel login
npx vercel link
bash scripts/push-vercel-env.sh .env.vercel production
```

## Vercel — GitHub CI (auto-sync)

On every push to `main`, GitHub Actions syncs **Repository Secrets** to Vercel and deploys. No `.env.vercel` file needed for CI.

See [docs/CI_SETUP.md](docs/CI_SETUP.md) for required GitHub Secrets (`VERCEL_TOKEN`, `OPENAI_API_KEY`, `REDIS_URL`, etc.).

## Pull env from Vercel (backup)

```bash
vercel env pull .env.vercel.pulled --environment=production
```

## Commit identity

All commits must use **David Su &lt;dtscraft@gmail.com&gt;**. Do not rely on `git config user.email`.

```bash
npm run git:commit -- -m "your message"
```

See [docs/COMMITS.md](docs/COMMITS.md) for multi-line messages and verification.

## Security

- Never commit `.env.local` or `.env.vercel`
- Before `git push`: run `git status` and confirm no env files are staged
- Production Redis must use Redis Cloud (`rediss://`), not `localhost`
