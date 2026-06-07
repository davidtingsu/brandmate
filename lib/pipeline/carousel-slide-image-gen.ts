import { usesPortraitBackground } from "@/lib/carousel/templates";
import { CAROUSEL_IMAGE_MODEL, SUPABASE_STORAGE_BUCKET } from "@/lib/config";
import { buildRevisionPromptBlocks } from "@/lib/pipeline/revision-prompt";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type {
  BrandProfile,
  CarouselSlide,
  CarouselSlideLayout,
  PostBrandingOptions,
} from "@/lib/types";
import { getOpenAI } from "@/lib/weave/openai";
import { readFile } from "fs/promises";
import { join } from "path";
import { toFile } from "openai/uploads";

export const CAROUSEL_REFS_DIR = "public/examples/carousel-refs";

/** Cookbook §5.9 compositing lead — grep target for Ralph checks */
export const PORTRAIT_COMPOSITING_LEAD =
  "Place the person from Image 2 into Image 1";

const MIDDLE_REFS = [2, 3, 4, 5, 6] as const;

export function getCarouselReferenceIndex(
  slideIndex: number,
  totalSlides: number
): number {
  if (slideIndex === 0) return 1;
  if (slideIndex === totalSlides - 1) return 7;
  const middleIndex = slideIndex - 1;
  return MIDDLE_REFS[middleIndex % MIDDLE_REFS.length];
}

export function carouselRefPath(refIndex: number): string {
  return join(
    process.cwd(),
    CAROUSEL_REFS_DIR,
    `carousel-ref-${String(refIndex).padStart(2, "0")}.png`
  );
}

function shouldIncludePortrait(input: {
  portraitImageUrl?: string;
  slide: CarouselSlide;
  totalSlides: number;
  refIndex: number;
}): boolean {
  if (!input.portraitImageUrl) return false;
  const layout = (input.slide.layout ?? "template_content") as CarouselSlideLayout;
  return (
    input.refIndex === 1 ||
    input.refIndex === 7 ||
    usesPortraitBackground(layout, true)
  );
}

function slideContentBlock(input: {
  slide: CarouselSlide;
  topic?: string;
  brandProfile?: BrandProfile;
  branding?: PostBrandingOptions;
  totalSlides: number;
  refIndex: number;
}): string {
  const slideNum = input.slide.index + 1;
  const handle =
    input.branding?.includeHandle && input.brandProfile?.handle
      ? input.brandProfile.handle
      : undefined;

  const handleNote =
    input.refIndex === 7 && handle
      ? `Include the handle "${handle}" in the CTA area, matching the reference placement style.`
      : "";

  return `Slide ${slideNum} of ${input.totalSlides}. Show "${slideNum}/${input.totalSlides}" pagination if the reference includes slide numbers.

Title (large, prominent): ${input.slide.title}

Body copy (fit naturally into the reference layout):
${input.slide.body}

${input.topic ? `Carousel topic: ${input.topic}` : ""}
${input.brandProfile?.name ? `Author: ${input.brandProfile.name}` : ""}
${handleNote}

Portrait LinkedIn carousel slide (4:5). Legible text only — no paragraph blocks outside the designed areas.`;
}

function feedbackBlock(userFeedback?: string): string {
  const revision = buildRevisionPromptBlocks({ userFeedback });
  if (!revision) return "";
  return `${revision}\n\nOn any conflict between user feedback and Image 1 styling, follow the user.\n\n`;
}

const LOOSE_REF_STYLE =
  "Image 1 is a loose style reference — borrow general LinkedIn carousel feel (hand-drawn typography, doodle accents, layout density), not exact colors, overlays, background, or decorative details.";

export function buildSlideImagePrompt(input: {
  slide: CarouselSlide;
  topic?: string;
  brandProfile?: BrandProfile;
  branding?: PostBrandingOptions;
  totalSlides: number;
  refIndex: number;
  includesPortrait: boolean;
  compositingMode?: boolean;
  userFeedback?: string;
}): string {
  const content = slideContentBlock(input);
  const revision = feedbackBlock(input.userFeedback);

  if (input.includesPortrait && input.compositingMode) {
    return `${revision}Image 1 is a loose LinkedIn carousel slide layout reference.
Image 2 is the author's portrait photo.

${PORTRAIT_COMPOSITING_LEAD}'s portrait area (same position, scale, and framing as the person in Image 1).
${LOOSE_REF_STYLE} User feedback governs overlays, overlay text, background, and decorative style when provided.

STRICT — preserve the person's exact facial identity from Image 2: eyes, nose, mouth, jawline, skin tone, hair, and expression. Do not redraw, beautify, or alter the face.

Create a NEW slide for a different topic. Do NOT copy Image 1's original topic text. Update text only:

${content}`;
  }

  return `${revision}${LOOSE_REF_STYLE}

Create a NEW slide for a different topic. Do NOT copy the reference slide's text or topic.

${content}`;
}

async function loadImageBuffer(url: string): Promise<Buffer> {
  if (url.startsWith("data:")) {
    const base64 = url.split(",")[1];
    if (!base64) throw new Error("Invalid data URL");
    return Buffer.from(base64, "base64");
  }
  if (url.startsWith("/")) {
    const path = join(process.cwd(), "public", url.replace(/^\//, ""));
    return readFile(path);
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function loadCarouselReference(refIndex: number) {
  const path = carouselRefPath(refIndex);
  const buffer = await readFile(path);
  return toFile(buffer, `carousel-ref-${String(refIndex).padStart(2, "0")}.png`, {
    type: "image/png",
  });
}

async function uploadSlidePng(buffer: Buffer, filename: string): Promise<string> {
  if (isSupabaseConfigured()) {
    const supabase = createServerClient();
    const path = `carousel/${filename}`;
    const { error } = await supabase.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .upload(path, buffer, {
        contentType: "image/png",
        upsert: true,
      });
    if (error) throw new Error(`Storage upload failed: ${error.message}`);
    const { data } = supabase.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .getPublicUrl(path);
    return data.publicUrl;
  }
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

function extractB64(
  data: Array<{ b64_json?: string | null }> | undefined
): string {
  const b64 = data?.[0]?.b64_json;
  if (!b64) throw new Error("Carousel slide image generation returned no data");
  return b64;
}

type PortraitEditImages = [
  Awaited<ReturnType<typeof loadCarouselReference>>,
  Awaited<ReturnType<typeof toFile>>,
];

const GPT_IMAGE_15 = "gpt-image-1.5";
const GPT_IMAGE_1 = "gpt-image-1";

function usesInputFidelity(model: string, compositing: boolean): boolean {
  return compositing && model === GPT_IMAGE_15;
}

async function runCarouselImageEdit(input: {
  model: string;
  image: Awaited<ReturnType<typeof loadCarouselReference>> | PortraitEditImages;
  prompt: string;
  compositing: boolean;
}) {
  const openai = getOpenAI();
  const base = {
    model: input.model,
    image: input.image,
    prompt: input.prompt,
    size: "1024x1536" as const,
    quality: "high" as const,
  };

  if (usesInputFidelity(input.model, input.compositing)) {
    return openai.images.edit({
      ...base,
      input_fidelity: "high",
    } as Parameters<typeof openai.images.edit>[0]);
  }

  return openai.images.edit(base);
}

async function editWithFallback(input: {
  primaryModel: string;
  image: Awaited<ReturnType<typeof loadCarouselReference>> | PortraitEditImages;
  prompt: string;
  compositing: boolean;
}) {
  const fallbacks = input.compositing
    ? [input.primaryModel, GPT_IMAGE_15, GPT_IMAGE_1].filter(
        (m, i, arr) => arr.indexOf(m) === i
      )
    : [input.primaryModel];

  let lastError: unknown;
  for (const model of fallbacks) {
    try {
      return await runCarouselImageEdit({
        model,
        image: input.image,
        prompt: input.prompt,
        compositing: input.compositing,
      });
    } catch (err) {
      lastError = err;
      if (model === fallbacks[fallbacks.length - 1]) break;
      console.warn(
        `[carousel-slide-image-gen] ${model} edit failed, trying fallback:`,
        err
      );
    }
  }
  throw lastError;
}

export async function generateCarouselSlideImage(input: {
  slide: CarouselSlide;
  portraitImageUrl?: string;
  topic?: string;
  brandProfile?: BrandProfile;
  branding?: PostBrandingOptions;
  userFeedback?: string;
  totalSlides: number;
}): Promise<string> {
  const refIndex = getCarouselReferenceIndex(
    input.slide.index,
    input.totalSlides
  );
  const includesPortrait = shouldIncludePortrait({
    portraitImageUrl: input.portraitImageUrl,
    slide: input.slide,
    totalSlides: input.totalSlides,
    refIndex,
  });

  const compositingMode =
    includesPortrait && Boolean(input.portraitImageUrl);

  const prompt = buildSlideImagePrompt({
    slide: input.slide,
    topic: input.topic,
    brandProfile: input.brandProfile,
    branding: input.branding,
    totalSlides: input.totalSlides,
    userFeedback: input.userFeedback,
    refIndex,
    includesPortrait,
    compositingMode,
  });

  const referenceImage = await loadCarouselReference(refIndex);

  let image:
    | Awaited<ReturnType<typeof loadCarouselReference>>
    | PortraitEditImages = referenceImage;

  if (compositingMode && input.portraitImageUrl) {
    const portraitBuf = await loadImageBuffer(input.portraitImageUrl);
    const portraitFile = await toFile(portraitBuf, "portrait.jpg", {
      type: "image/jpeg",
    });
    image = [referenceImage, portraitFile];
  }

  const response = await editWithFallback({
    primaryModel: CAROUSEL_IMAGE_MODEL,
    image,
    prompt,
    compositing: compositingMode,
  });

  const buffer = Buffer.from(extractB64(response.data), "base64");
  const filename = `slide-${Date.now()}-${input.slide.index}-ref${refIndex}.png`;
  return uploadSlidePng(buffer, filename);
}
