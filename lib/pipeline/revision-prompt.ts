export function buildRevisionPromptBlocks(input: {
  userFeedback?: string;
  judgeRevisionContext?: string;
  scoreBefore?: number;
}): string {
  const blocks: string[] = [];

  if (input.userFeedback?.trim()) {
    blocks.push(
      `HIGHEST PRIORITY — User revision feedback. Override any conflicting preset instructions:\n${input.userFeedback.trim()}`
    );
  }

  if (input.judgeRevisionContext?.trim()) {
    blocks.push(input.judgeRevisionContext.trim());
  } else if (input.scoreBefore !== undefined) {
    blocks.push(
      `Previous attempt scored ${input.scoreBefore}/10. Improve specifically on prior weaknesses.`
    );
  }

  return blocks.join("\n\n");
}
