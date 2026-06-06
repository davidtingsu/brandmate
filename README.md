# BrandMate

**Your LinkedIn brand coach that learns from every draft.**

A chat-only [CopilotKit](https://copilotkit.ai) app for LinkedIn personal brand growth. Posts, judge scores, learned lessons, and retry buttons appear as **generative UI cards** inline in the conversation.

**Observability:** [W&B Weave](https://docs.wandb.ai/weave) traces every agent step (generate → judge → memory → retry), logs scores and human feedback, and tracks cost/latency.

## Live demo

**GitHub:** https://github.com/davidtingsu/brandmate

Deploy to Vercel — see [Deploy](#deploy-to-vercel) below. After deploy, your URL will look like `https://brandmate-*.vercel.app`.

## Architecture

```
User → CopilotChat → useCopilotAction
  → orchestratePostLoop (Weave)
  → searchMemories (Redis KNN)
  → generatePost / judgePost / summarizeLesson (gpt-4o-mini)
  → Generative UI cards (PostCard, AttemptCard, LessonCard)
  → storeLesson in Redis → retry improves next attempt
```

| Layer | Tool | Role |
|-------|------|------|
| UI | CopilotKit `CopilotChat` | Entire product — chat + generative cards |
| Runtime memory | Redis Stack vector search | Store/retrieve voice lessons |
| Observability | W&B Weave | Trace ops, log scores, track cost |
| LLM | OpenAI `gpt-4o-mini` via `wrapOpenAI` | Generation, judging, memory |

**Dual memory:** Redis = lessons in prompts; Weave = traces, scores, cost.

## Prerequisites

- Node.js 18+
- Docker (Redis Stack locally)
- OpenAI API key
- W&B API key (for Weave tracing)
- Redis Cloud URL for production (not localhost)

## Quick start

```bash
# 1. Env
cp .env.local.example .env.local
# Fill: OPENAI_API_KEY, WANDB_API_KEY, WEAVE_PROJECT

# 2. Redis (local)
docker compose up -d

# 3. Run
npm install
npm run dev
```

Open http://localhost:3000

## Hackathon demo script

See [docs/DEMO.md](docs/DEMO.md) for the full 3-act script (chat + Weave dashboard).

**Act 1:** Set brand profile → write post → feedback "too generic" → store lesson  
**Act 2:** Retry (8/10) → new topic retrieves lesson from Redis  
**Act 3:** Open Weave UI — compare Attempt #1 vs #2 traces

## Budget guards

Models and token caps are locked in [`lib/config.ts`](lib/config.ts):

| Setting | Value |
|---------|-------|
| `MODEL` | `gpt-4o-mini` only — never `gpt-4o` |
| `EMBEDDING_MODEL` | `text-embedding-3-small` |
| `max_tokens` | 800 generate / 400 judge / 150 memory |

**Recommended:** Set a **$15/month** spending limit at [OpenAI organization limits](https://platform.openai.com/settings/organization/limits).

**Cost per post loop:** ~$0.002–$0.01 (generate + judge + memory + embed).

## Environment files

| File | Purpose | Committed? | `REDIS_URL` |
|------|---------|------------|-------------|
| `.env.local` | Local `npm run dev` | No | `redis://localhost:6379` |
| `.env.vercel` | Push secrets to Vercel | No | `rediss://...` (Redis Cloud) |
| `.env.local.example` | Local template | Yes | localhost placeholder |
| `.env.vercel.example` | Vercel template | Yes | Redis Cloud placeholder |

```bash
npm run env:push-vercel   # after cp .env.vercel.example .env.vercel
```

GitHub Actions auto-sync: see [docs/CI_SETUP.md](docs/CI_SETUP.md).

## Deploy to Vercel

1. Push to **public** GitHub repo `brandmate` (no secrets in git)
2. Provision [Redis Cloud](https://redis.io/cloud) free tier (30MB)
3. Import repo at [vercel.com/new](https://vercel.com/new)
4. Set env vars: `OPENAI_API_KEY`, `REDIS_URL` (rediss://), `WANDB_API_KEY`, `WEAVE_PROJECT`
5. Deploy → add live URL to this README

Or use GitHub Actions (`.github/workflows/deploy.yml`) with repository secrets.

## Weave traces

After running a post loop, open:

```
https://wandb.ai/YOUR_USERNAME/brandmate/weave
```

Traced ops: `orchestratePostLoop`, `searchMemories`, `generatePost`, `judgePost`, `summarizeLesson`, `storeLesson`, `logHumanFeedback`.

## Project structure

```
app/page.tsx              # CopilotChat only
hooks/usePostActions.tsx  # CopilotKit actions + generative render
components/generative/    # PostCard, AttemptCard, LessonCard, etc.
lib/weave/ops.ts          # All weave.op functions
lib/redis/                # Vector lesson store
instrumentation.ts        # weave.init on server start
```

## Commit identity

All commits use **David Su <dtscraft@gmail.com>**. See [docs/COMMITS.md](docs/COMMITS.md).

```bash
npm run git:commit -- -m "your message"
```

## Security

- Never commit `.env.local` or `.env.vercel`
- Before `git push`: `git status` — confirm no env files staged
- Production Redis must use Redis Cloud (`rediss://`), not `localhost`

## License

MIT — see [LICENSE](LICENSE).
