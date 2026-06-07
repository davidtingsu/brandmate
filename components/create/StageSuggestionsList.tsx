"use client";

import { CreateFlowChips } from "@/components/create/CreateFlowChips";
import { useCreateFlow } from "@/contexts/CreateFlowContext";
import {
  getEnabledPostChips,
  getStageChips,
} from "@/lib/create-flow/stage-chips";
import type { RenderSuggestionsListProps } from "@copilotkit/react-ui";

export function StageSuggestionsList({
  onSuggestionClick,
  isLoading,
}: RenderSuggestionsListProps) {
  const { stage, lastAttempt } = useCreateFlow();

  if (stage === "post") {
    const chips = getEnabledPostChips(lastAttempt);
    if (chips.length === 0) return null;

    return (
      <div className="suggestions">
        <CreateFlowChips
          chips={chips}
          disabled={isLoading}
          onChipClick={(message) => {
            if (isLoading) return;
            onSuggestionClick(message);
          }}
        />
      </div>
    );
  }

  const chips = getStageChips(stage);
  if (chips.length === 0) return null;

  return (
    <div className="suggestions">
      <CreateFlowChips
        chips={chips}
        disabled={isLoading}
        onChipClick={(message) => {
          if (isLoading) return;
          onSuggestionClick(message);
        }}
      />
    </div>
  );
}
