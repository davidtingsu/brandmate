export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initWeave } = await import("@/lib/weave/init");
    await initWeave();
  }
}
