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
} as const;

export const WEAVE_PROJECT =
  process.env.WEAVE_PROJECT ?? "your-username/brandmate";

/** Top lessons injected into prompts — keeps context small and cheap */
export const MAX_LESSONS_IN_PROMPT = 3;

/** OpenAI org spending limit recommendation (set manually in dashboard) */
export const RECOMMENDED_OPENAI_MONTHLY_LIMIT_USD = 15;
