/**
 * CopilotKit can replay historic SSE events on reconnect (same thread),
 * appending assistant text a second time. Detect exact doubled content.
 */
export function dedupeRepeatedContent(content: string): string {
  if (!content || content.length < 40) return content;
  if (content.length % 2 !== 0) return content;

  const half = content.length / 2;
  const first = content.slice(0, half);
  const second = content.slice(half);

  if (first === second) return first;
  return content;
}
