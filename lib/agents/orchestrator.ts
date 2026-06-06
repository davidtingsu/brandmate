import { orchestratePostLoop } from "@/lib/weave/ops";
import type { OrchestrateInput, OrchestrateOutput } from "@/lib/types";

export async function runPostLoop(
  input: OrchestrateInput
): Promise<OrchestrateOutput> {
  return orchestratePostLoop(input);
}
