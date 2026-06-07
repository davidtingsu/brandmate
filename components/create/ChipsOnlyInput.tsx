"use client";

import { CreateFlowChips } from "@/components/create/CreateFlowChips";
import { useCreateFlow } from "@/contexts/CreateFlowContext";
import { getStageChips } from "@/lib/create-flow/stage-chips";
import type { InputProps } from "@copilotkit/react-ui";

export function ChipsOnlyInput({ inProgress, onSend }: InputProps) {
  const { stage } = useCreateFlow();
  const chips = getStageChips(stage);

  const handleChipClick = (message: string) => {
    if (inProgress) return;
    void onSend(message);
  };

  return (
    <div className="copilotKitInput border-t border-slate-200 bg-white px-3 py-3">
      <p className="mb-2 text-xs text-slate-500">
        Tap a chip to ask the coach — complete the form above to continue.
      </p>
      <CreateFlowChips
        chips={chips}
        onChipClick={handleChipClick}
        disabled={inProgress}
      />
    </div>
  );
}
