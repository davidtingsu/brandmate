/**
 * Budget guards — lock models and token caps in one place.
 * NEVER change MODEL to gpt-4o (see README budget section).
 */
export const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
export const EMBEDDING_MODEL =
  process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small";
export const EMBEDDING_DIMENSIONS = 1536;

export const MAX_TOKENS = {
  generate: 800,
  judge: 400,
  memory: 150,
  carousel: 1200,
} as const;

export const DEFAULT_SLIDE_COUNT = 7;
export const MIN_SLIDE_COUNT = 5;
export const MAX_SLIDE_COUNT = 10;

export const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1";
export const SUPABASE_STORAGE_BUCKET =
  process.env.SUPABASE_STORAGE_BUCKET ?? "post-images";

export const WEAVE_PROJECT =
  process.env.WEAVE_PROJECT ?? "your-username/brandmate";

/** Top lessons injected into prompts — keeps context small and cheap */
export const MAX_LESSONS_IN_PROMPT = 3;

/** OpenAI org spending limit recommendation (set manually in dashboard) */
export const RECOMMENDED_OPENAI_MONTHLY_LIMIT_USD = 15;
