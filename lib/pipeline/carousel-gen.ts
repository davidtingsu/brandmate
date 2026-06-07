import {
  DEFAULT_SLIDE_COUNT,
  MAX_SLIDE_COUNT,
  MAX_TOKENS,
  MIN_SLIDE_COUNT,
} from "@/lib/config";
import { buildCarouselSlides, buildLinkedInPost } from "@/lib/linkedin-format";
import type { CarouselGenerateInput, CarouselGenerateOutput } from "@/lib/types";
import { getOpenAI, MODEL } from "@/lib/weave/openai";

async function parseJson<T>(content: string): Promise<T> {
  const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();
  return JSON.parse(cleaned) as T;
}

export async function generateCarouselCore(
  input: CarouselGenerateInput
): Promise<CarouselGenerateOutput> {
  const openai = getOpenAI();
  const postType = input.postType ?? "story";
  const slideCount = Math.min(
    MAX_SLIDE_COUNT,
    Math.max(MIN_SLIDE_COUNT, input.slideCount ?? DEFAULT_SLIDE_COUNT)
  );

  const lessonsText =
    input.lessons.length > 0
      ? input.lessons.map((l, i) => `${i + 1}. ${l.lesson}`).join("\n")
      : "No prior lessons.";

  const scoreContext =
    input.scoreBefore !== undefined
      ? `Previous attempt scored ${input.scoreBefore}/10. Improve specifically on prior weaknesses.`
      : "";

  const portraitContext = input.portraitImageUrl
    ? "A portrait photo is provided. Choose per-slide layout dynamically."
    : "No portrait photo — use template_content and split_before_after for all slides.";

  const response = await openai.chat.completions.create({
    model: MODEL,
    max_tokens: MAX_TOKENS.carousel,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You write LinkedIn carousel posts for personal brand growth. Return JSON:
{
  "variants": [
    {
      "hook": string,
      "body": string (short caption above carousel),
      "cta": string,
      "hashtags": string[],
      "slides": [{ "title": string, "body": string, "layout": string }]
    }
  ]
}
Exactly 2 variants (A/B). Each variant must have exactly ${slideCount} slides.

Per-slide layout (pick dynamically per slide):
- portrait_cover: full-bleed portrait + handwritten hook (usually slide 1 when portrait provided)
- portrait_cta: portrait + CTA/handle (usually last slide)
- portrait_all: portrait background for personal/story slides
- template_content: aesthetic template without portrait (middle educational slides)
- split_before_after: before/after comparison panels

${portraitContext}
Slide 1 is the cover (bold title). Last slide has a CTA. Post type: ${postType}. Apply learned lessons.`,
      },
      {
        role: "user",
        content: `Topic: ${input.topic}
Brand: ${input.brandProfile.name} | Niche: ${input.brandProfile.niche}
Audience: ${input.brandProfile.audience}
Voice: ${input.brandProfile.voice}
Attempt: ${input.attemptNumber}
${scoreContext}

Learned lessons:
${lessonsText}`,
      },
    ],
  });

  const raw = await parseJson<{
    variants: Array<{
      hook: string;
      body: string;
      cta?: string;
      hashtags?: string[];
      slides: Array<{ title: string; body: string; layout?: string }>;
    }>;
  }>(response.choices[0]?.message?.content ?? '{"variants":[]}');

  const hasPortrait = Boolean(input.portraitImageUrl);

  const variants = raw.variants.map((v) =>
    buildLinkedInPost({
      hook: v.hook,
      body: v.body,
      cta: v.cta,
      hashtags: v.hashtags,
      postType,
      format: "carousel",
      slides: buildCarouselSlides(v.slides ?? [], hasPortrait),
    })
  );

  return { variants, attemptNumber: input.attemptNumber, postType };
}
