/** Summarize a post topic for the posts gallery (truncate + light cleanup). */
export function summarizePostTitle(topic: string, maxLen = 42): string {
  const cleaned = topic.replace(/\s+/g, " ").trim();
  if (!cleaned) return "Untitled post";
  if (cleaned.length <= maxLen) return cleaned;
  const truncated = cleaned.slice(0, maxLen).replace(/\s+\S*$/, "");
  return `${truncated}…`;
}
