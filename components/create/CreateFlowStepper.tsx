"use client";

import { useCreateFlow } from "@/contexts/CreateFlowContext";
import {
  STUDIO_STAGE_LABELS,
  STUDIO_STAGE_ORDER,
  type StudioFlowStage,
} from "@/lib/create-flow/stages";

function stepIndex(stage: StudioFlowStage): number {
  return STUDIO_STAGE_ORDER.indexOf(stage);
}

export function CreateFlowStepper() {
  const { stage } = useCreateFlow();
  const current = stepIndex(stage);

  return (
    <nav
      data-testid="create-flow-stepper"
      aria-label="Create post steps"
      className="mb-4 flex items-center justify-center gap-2 border-b border-slate-100 pb-4 pt-2"
    >
      {STUDIO_STAGE_ORDER.map((step, index) => {
        const done = index < current;
        const active = index === current;
        const label = STUDIO_STAGE_LABELS[step];

        return (
          <div key={step} className="flex items-center gap-2">
            {index > 0 && (
              <span
                className={`text-xs ${
                  done || active ? "text-slate-400" : "text-slate-200"
                }`}
                aria-hidden
              >
                →
              </span>
            )}
            <div
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition ${
                active
                  ? "bg-linkedin text-white"
                  : done
                    ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                    : "bg-slate-50 text-slate-400 ring-1 ring-slate-200"
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                  active
                    ? "bg-white/20 text-white"
                    : done
                      ? "bg-green-600 text-white"
                      : "bg-slate-200 text-slate-500"
                }`}
              >
                {done ? "✓" : index + 1}
              </span>
              <span>{label}</span>
            </div>
          </div>
        );
      })}
    </nav>
  );
}
