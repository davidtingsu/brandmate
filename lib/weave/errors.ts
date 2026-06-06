export function isWeaveTraceError(error: unknown): boolean {
  if (error instanceof Response) {
    return !error.ok;
  }
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes("fetch failed") ||
      msg.includes("unable to get local issuer certificate") ||
      msg.includes("wandb") ||
      msg.includes("weave")
    );
  }
  return false;
}

export function formatError(error: unknown): string {
  if (error instanceof Response) {
    return `Weave trace upload failed (${error.status} ${error.statusText})`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}
