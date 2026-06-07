# Vercel deployment checklist

## 1. Import from GitHub

1. Open https://vercel.com/new
2. Import **davidtingsu/brandmate**
3. Framework: Next.js (auto-detected)

## 2. Environment variables

Set in Vercel → Settings → Environment Variables (Production):

| Variable | Value |
|----------|-------|
| `OPENAI_API_KEY` | Your OpenAI key |
| `REDIS_URL` | Redis Cloud `rediss://...` (not localhost) |
| `WANDB_API_KEY` | Your W&B key |
| `WEAVE_PROJECT` | e.g. `your-username/brandmate` |
| `OPENAI_MODEL` | `gpt-4o-mini` |
| `OPENAI_CAROUSEL_MODEL` | `gpt-5.5` (carousel copy + judge) |
| `OPENAI_EMBEDDING_MODEL` | `text-embedding-3-small` |

Or use GitHub Actions secrets + `.github/workflows/deploy.yml` (see [CI_SETUP.md](CI_SETUP.md)).

## 3. Redis Cloud

1. Create free 30MB database at https://redis.io/cloud
2. Enable Redis Stack / search modules
3. Copy `rediss://` URL into `REDIS_URL`

## 4. Deploy

**Dashboard:** Deploy button after env vars are set.

**CLI:**

```bash
vercel login
vercel link
npm run env:push-vercel   # if using .env.vercel locally
vercel --prod
```

## 5. Verify production

- [ ] Chat loads at production URL
- [ ] `createPost` completes (needs Redis Cloud + OpenAI)
- [ ] Weave traces appear for production requests
- [ ] Update README live demo URL

## Cost

- Vercel Hobby: free
- Redis Cloud free tier: free
- OpenAI: ~$0.002–$0.01 per post loop — set $15/mo org limit
