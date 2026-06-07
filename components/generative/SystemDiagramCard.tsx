"use client";

import type { SystemDiagram } from "@/lib/types";

interface SystemDiagramCardProps {
  diagram: SystemDiagram;
  imageUrl: string;
  agentLabel?: string;
}

export function SystemDiagramCard({
  diagram,
  imageUrl,
  agentLabel = "diagram_explainer",
}: SystemDiagramCardProps) {
  const downloadDiagram = async () => {
    const res = await fetch(imageUrl);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${diagram.title.replace(/\s+/g, "-").toLowerCase()}-diagram.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md">
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          System diagram · {agentLabel}
        </p>
        <h3 className="mt-0.5 text-base font-bold text-slate-900">
          {diagram.title}
        </h3>
      </div>

      <div className="bg-slate-100 p-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={diagram.title}
          className="h-auto w-full rounded-lg"
        />
      </div>

      <div className="flex justify-end border-t border-slate-100 px-4 py-2">
        <button
          type="button"
          onClick={() => void downloadDiagram()}
          className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          Download diagram
        </button>
      </div>
    </div>
  );
}
