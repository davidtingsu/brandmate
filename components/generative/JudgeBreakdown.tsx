"use client";

import type { JudgeBreakdown as JudgeBreakdownType } from "@/lib/types";

const CRITERIA: Array<{ key: keyof JudgeBreakdownType; label: string; weight: string }> = [
  { key: "hook_strength", label: "Hook strength", weight: "25%" },
  { key: "voice_authenticity", label: "Voice authenticity", weight: "25%" },
  { key: "audience_fit", label: "Audience fit", weight: "20%" },
  { key: "engagement_potential", label: "Engagement potential", weight: "15%" },
  { key: "brand_alignment", label: "Brand alignment", weight: "15%" },
];

interface JudgeBreakdownProps {
  breakdown: JudgeBreakdownType;
  score: number;
}

export function JudgeBreakdown({ breakdown, score }: JudgeBreakdownProps) {
  return (
    <div className="my-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">Judge breakdown</h3>
        <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-sm font-bold text-linkedin">
          {score}/10
        </span>
      </div>
      <div className="space-y-2">
        {CRITERIA.map(({ key, label, weight }) => {
          const value = breakdown[key];
          return (
            <div key={key}>
              <div className="mb-0.5 flex justify-between text-xs text-slate-600">
                <span>
                  {label} <span className="text-slate-400">({weight})</span>
                </span>
                <span className="font-medium">{value}/10</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-linkedin transition-all"
                  style={{ width: `${(value / 10) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
