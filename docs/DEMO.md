# BrandMate — Hackathon Demo Script

**Pitch:** BrandMate — Your LinkedIn brand coach that learns from every draft.

Complete this demo in under 5 minutes (chat + Weave dashboard).

## Prerequisites

```bash
docker compose up -d
cp .env.local.example .env.local   # fill OPENAI_API_KEY, WANDB_API_KEY, WEAVE_PROJECT, Supabase keys
# Run supabase/migrations/001_sessions.sql in Supabase SQL Editor; create post-images bucket
npm run dev
```

Open http://localhost:3000

## Act 1 — Chat (personal brand onboarding)

1. Tell the coach your brand profile:

   > I'm Sarah, AI founder. My audience is early-stage founders. My voice is story-driven and vulnerable.

   The coach calls `setBrandProfile` → **BrandProfileCard** appears.

2. Request a post:

   > Write a post about my transition from Google engineer to AI startup founder

   Watch generative cards appear:
   - **MemoryListCard** (no lessons yet)
   - **PostCard** with LinkedIn **Preview** tab (feed mock) + Variant A/B
   - **JudgeBreakdown** (likely ~5/10 on first try)
   - **AttemptCard** with score
   - **HumanFeedbackButtons**

3. Give feedback:

   > That felt too generic

   Coach calls `submitHumanFeedback` → **LessonCard** with distilled lesson.

4. Store the lesson:

   > Approve and store that lesson

   Coach calls `storeLesson` → confirmation card (Redis vector memory).

## Act 2 — Chat (retry + memory retrieval)

5. Retry:

   > Retry the same topic

   Coach calls `retryWithLesson` → improved **PostCard** (~8/10), **MemoryListCard** shows retrieved lesson.

6. New topic with memory:

   > Write about my first product launch failure

   **MemoryListCard** shows 1 lesson → post scores higher on first attempt.

## Act 3 — Weave dashboard (prove improvement)

7. Open your Weave project:

   ```
   https://wandb.ai/YOUR_USERNAME/brandmate/weave
   ```

8. Show side-by-side traces:
   - Attempt #1: `orchestratePostLoop` → `searchMemories` → `generatePost` → `judgePost` (score ~5)
   - Attempt #2: same tree with lesson in `generatePost` inputs (score ~8)

9. Point out:
   - OpenAI cost per trace (~$0.002–$0.01 total for full loop)
   - Judge breakdown improving on **voice authenticity**
   - `score_before` / `score_after` in op outputs

## Copy post (bonus)

> Copy variant A to clipboard

Coach calls `copyPost` → green confirmation toast in chat.

## LinkedIn previews (text, image, carousel)

- **Text post:** Preview tab shows feed mock (avatar, caption, engagement bar).
- **Post with image:** `Write a text post with an image about X` → image below caption in preview.
- **Carousel:** `Write a carousel about X` → swipeable slides with page indicator.
- Ambiguous format triggers **FormatPickerCard** (Text / Post with Image / Carousel).

## Chat sessions (Supabase)

1. Sidebar lists saved chats when Supabase env vars are set.
2. **+ New chat** starts a fresh session.
3. **Delete** (×) removes a session from Supabase.
4. Switching sessions restores **GenerativeCardReplay** for past post drafts.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Redis connection error | `docker compose up -d` and check `REDIS_URL=redis://localhost:6380` (not plain redis on 6379) |
| Weave traces missing | Set `WANDB_API_KEY` and `WEAVE_PROJECT` in `.env.local` |
| Sessions sidebar empty | Run `supabase/migrations/001_sessions.sql`; set publishable + secret keys |
| Post with Image fails | Create `post-images` bucket in Supabase Storage; set `OPENAI_IMAGE_MODEL` |
| OpenAI errors | Check API key; set $15/mo limit at platform.openai.com |
