"use client";

import type { HumanFeedbackType } from "@/lib/types";

const BUTTONS: Array<{ type: HumanFeedbackType; label: string }> = [
  { type: "too_generic", label: "Too generic" },
  { type: "too_long", label: "Too long" },
  { type: "on_brand", label: "On brand" },
  { type: "good", label: "Good" },
];

interface HumanFeedbackButtonsProps {
  onSelect: (feedback: HumanFeedbackType) => void;
  disabled?: boolean;
  selected?: HumanFeedbackType;
}

export function HumanFeedbackButtons({
  onSelect,
  disabled,
  selected,
}: HumanFeedbackButtonsProps) {
  return (
    <div className="my-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="mb-2 text-xs font-medium text-slate-600">
        How does this draft feel?
      </p>
      <div className="flex flex-wrap gap-2">
        {BUTTONS.map(({ type, label }) => (
          <button
            key={type}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(type)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
              selected === type
                ? "bg-slate-800 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            } disabled:opacity-50`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
