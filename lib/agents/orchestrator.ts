import { runOrchestratePostLoop } from "@/lib/pipeline/post-loop";
import type { OrchestrateInput, OrchestrateOutput } from "@/lib/types";
import { disableWeave, initWeave, isWeaveEnabled } from "@/lib/weave/init";
import { formatError, isWeaveTraceError } from "@/lib/weave/errors";
import { orchestratePostLoop as tracedOrchestrate } from "@/lib/weave/ops";

export async function runPostLoop(
  input: OrchestrateInput
): Promise<OrchestrateOutput> {
  if (!isWeaveEnabled()) {
    return runOrchestratePostLoop(input);
  }

  await initWeave();

  try {
    return await tracedOrchestrate(input);
  } catch (error) {
    if (isWeaveTraceError(error)) {
      disableWeave(formatError(error));
      return runOrchestratePostLoop(input);
    }
    throw error;
  }
}
