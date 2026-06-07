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
      "slides": [{ "title": string, "body": string }]
    }
  ]
}
Exactly 2 variants (A/B). Each variant must have exactly ${slideCount} slides. Slide 1 is the cover (bold title). Last slide has a CTA. Post type: ${postType}. Apply learned lessons.`,
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
      slides: Array<{ title: string; body: string }>;
    }>;
  }>(response.choices[0]?.message?.content ?? '{"variants":[]}');

  const variants = raw.variants.map((v) =>
    buildLinkedInPost({
      hook: v.hook,
      body: v.body,
      cta: v.cta,
      hashtags: v.hashtags,
      postType,
      format: "carousel",
      slides: buildCarouselSlides(v.slides ?? []),
    })
  );

  return { variants, attemptNumber: input.attemptNumber, postType };
}
