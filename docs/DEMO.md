# BrandMate — Hackathon Demo Script

**Pitch:** BrandMate — Your LinkedIn brand coach that learns from every draft.

Complete this demo in under 5 minutes (gallery → chat → feed preview → Weave).

## Prerequisites

```bash
docker compose up -d
cp .env.local.example .env.local   # fill OPENAI_API_KEY, WANDB_API_KEY, WEAVE_PROJECT, Supabase keys
# Run supabase/migrations/001_sessions.sql in Supabase SQL Editor; create post-images bucket
npm run dev
```

Open http://localhost:3000

## Act 1 — Gallery + Copilot chat (onboarding)

1. Land on **`/`** — post gallery (empty or saved posts).

2. Click **+ Create Post** → opens **`/create`** CopilotKit chat.

3. Ask the coach to set up your profile, or say "create my profile" — **ProfileForm** appears inline in chat.

4. Ask to generate a post — **GeneratePostForm** appears (Text / Post with Image / Carousel).

5. Watch generative cards:
   - **MemoryListCard**
   - **PostCard** with LinkedIn **Preview** tab + Variant A/B
   - **JudgeBreakdown**
   - **HumanFeedbackButtons**

6. Click feedback (e.g. **Too generic**) → **LessonCard** → **Store lesson**.

7. Click **Preview in feed** → **`/preview/[sessionId]`** (LinkedIn center column, no chat).

8. Click **Exit preview** → back to gallery.

## Act 2 — Concept diagram (diagram_explainer)

1. In chat, ask: *"Explain what happens when you type a URL in a browser"*

2. Coach calls **dispatchDiagramAgent** → **SystemDiagramCard** (ByteByteGo-style phases).

## Act 3 — Retry + memory

> Retry the same topic

Coach calls `retryWithLesson` → improved **PostCard** (~8/10), **MemoryListCard** shows retrieved lesson.

## Act 4 — Weave dashboard

```
https://wandb.ai/YOUR_USERNAME/brandmate/weave
```

Show `orchestratePostLoop` traces with score improvement attempt #1 → #2.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Redis connection error | `docker compose up -d`; `REDIS_URL=redis://localhost:6380` |
| Gallery empty | Run Supabase migration; set publishable + secret keys |
| Post with Image fails | Create `post-images` bucket in Supabase Storage |
| Diagram agent fails | Check `OPENAI_API_KEY` |
