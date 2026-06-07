"use client";

import type { StageChip } from "@/lib/create-flow/stage-chips";

interface CreateFlowChipsProps {
  chips: StageChip[];
  onChipClick: (message: string) => void;
  disabled?: boolean;
}

export function CreateFlowChips({
  chips,
  onChipClick,
  disabled = false,
}: CreateFlowChipsProps) {
  return (
    <div className="create-flow-chips flex flex-wrap gap-2">
      {chips.map((chip) => (
        <button
          key={chip.id}
          type="button"
          disabled={disabled}
          onClick={() => onChipClick(chip.message)}
          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-linkedin hover:bg-blue-50 hover:text-linkedin disabled:cursor-not-allowed disabled:opacity-50"
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}
