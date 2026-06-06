let weaveReady = false;
let weaveEnabled =
  process.env.DISABLE_WEAVE !== "true" && !!process.env.WANDB_API_KEY;

export function isWeaveEnabled(): boolean {
  return weaveEnabled;
}

export function disableWeave(reason: string): void {
  if (!weaveEnabled) return;
  weaveEnabled = false;
  weaveReady = false;
  console.warn(`[BrandMate] Weave tracing disabled: ${reason}`);
}

export async function initWeave(): Promise<void> {
  if (!weaveEnabled || weaveReady) return;

  try {
    const weave = await import("weave");
    const { WEAVE_PROJECT } = await import("@/lib/config");
    await weave.init(WEAVE_PROJECT);
    weaveReady = true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    disableWeave(message);
  }
}

export async function ensureWeave(): Promise<void> {
  await initWeave();
}
