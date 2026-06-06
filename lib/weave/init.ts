let weaveReady = false;

export async function initWeave(): Promise<void> {
  if (weaveReady) return;
  if (!process.env.WANDB_API_KEY) {
    console.warn("[BrandMate] WANDB_API_KEY not set — Weave tracing disabled");
    return;
  }

  const weave = await import("weave");
  const { WEAVE_PROJECT } = await import("@/lib/config");
  await weave.init(WEAVE_PROJECT);
  weaveReady = true;
}

export async function ensureWeave(): Promise<void> {
  await initWeave();
}
