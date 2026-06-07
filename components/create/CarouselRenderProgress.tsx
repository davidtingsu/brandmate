"use client";

import type { CarouselRenderState } from "@/hooks/useCarouselRender";

interface CarouselRenderProgressProps {
  state: CarouselRenderState;
}

export function CarouselRenderProgress({ state }: CarouselRenderProgressProps) {
  if (state.phase === "idle") return null;

  const pct =
    state.totalSlides > 0
      ? Math.round((state.currentSlide / state.totalSlides) * 100)
      : 0;

  const statusLabel =
    state.phase === "complete"
      ? "All slides rendered"
      : state.phase === "error"
        ? "Render failed"
        : `Rendering slide ${Math.min(state.currentSlide, state.totalSlides)} of ${state.totalSlides}…`;

  return (
    <div
      data-testid="carousel-render-progress"
      className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-800">{statusLabel}</span>
        {state.phase === "rendering" && (
          <span className="text-slate-500">{pct}%</span>
        )}
      </div>
      <div className="mb-3 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-linkedin transition-all duration-300"
          style={{ width: `${state.phase === "complete" ? 100 : pct}%` }}
        />
      </div>
      {state.slideStatuses.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {state.slideStatuses.map((status, i) => (
            <span
              key={i}
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                status === "done"
                  ? "bg-green-100 text-green-800"
                  : status === "rendering"
                    ? "bg-blue-100 text-linkedin"
                    : status === "error"
                      ? "bg-red-100 text-red-700"
                      : "bg-slate-100 text-slate-500"
              }`}
            >
              {i + 1}
            </span>
          ))}
        </div>
      )}
      {state.error && (
        <p className="mt-2 text-sm text-red-600">{state.error}</p>
      )}
    </div>
  );
}
