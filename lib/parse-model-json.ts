export function parseModelJson<T>(
  content: string | null | undefined,
  fallback?: T
): T {
  const cleaned = (content ?? "").replace(/```json\n?|\n?```/g, "").trim();
  if (!cleaned) {
    if (fallback !== undefined) return fallback;
    throw new Error(
      "Model returned empty content. If using GPT-5.x, increase the completion token budget."
    );
  }
  try {
    return JSON.parse(cleaned) as T;
  } catch (error) {
    const detail = error instanceof Error ? error.message : "parse error";
    throw new Error(`Invalid JSON from model: ${detail}`);
  }
}
