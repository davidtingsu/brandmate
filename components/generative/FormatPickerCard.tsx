"use client";

import { useState } from "react";

export interface FormatChoice {
  format: "text" | "carousel";
  includeImage: boolean;
  slideCount: number;
}

interface FormatPickerCardProps {
  topic?: string;
  onSelect: (choice: FormatChoice) => void;
}

export function FormatPickerCard({ topic, onSelect }: FormatPickerCardProps) {
  const [slideCount, setSlideCount] = useState(7);

  return (
    <div className="my-3 rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
      <h3 className="mb-1 text-sm font-semibold text-slate-900">
        Choose post format
      </h3>
      {topic && (
        <p className="mb-3 text-xs text-slate-600">Topic: {topic}</p>
      )}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() =>
            onSelect({ format: "text", includeImage: false, slideCount: 7 })
          }
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
        >
          Text
        </button>
        <button
          type="button"
          onClick={() =>
            onSelect({ format: "text", includeImage: true, slideCount: 7 })
          }
          className="rounded-lg bg-linkedin px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
        >
          Post with Image
        </button>
        <button
          type="button"
          onClick={() =>
            onSelect({ format: "carousel", includeImage: false, slideCount })
          }
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
        >
          Carousel
        </button>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
        <label htmlFor="slide-count">Carousel slides:</label>
        <input
          id="slide-count"
          type="number"
          min={5}
          max={10}
          value={slideCount}
          onChange={(e) => setSlideCount(Number(e.target.value))}
          className="w-14 rounded border border-slate-200 px-2 py-1 text-sm"
        />
      </div>
    </div>
  );
}
