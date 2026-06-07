"use client";

import { CircularProgressRing } from "@/components/ui/CircularProgressRing";

interface CarouselSlideSkeletonProps {
  slideIndex: number;
  totalSlides: number;
  status?: "pending" | "rendering" | "error";
  progress?: number;
  timeRemaining?: string;
}

export function CarouselSlideSkeleton({
  slideIndex,
  totalSlides,
  status = "pending",
  progress,
  timeRemaining,
}: CarouselSlideSkeletonProps) {
  const showRing = progress !== undefined && status !== "error";
  const label =
    status === "error"
      ? "Failed to generate"
      : status === "rendering"
        ? "Generating image…"
        : "Waiting…";

  return (
    <div
      data-testid="carousel-slide-skeleton"
      data-slide-index={slideIndex}
      className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-slate-100"
      aria-busy={status !== "error"}
      aria-label={`Slide ${slideIndex + 1} of ${totalSlides}: ${label}`}
    >
      {!showRing && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200" />
      )}
      {showRing && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
          <CircularProgressRing
            progress={progress}
            size={64}
            caption={timeRemaining}
          />
        </div>
      )}
      {!showRing && (
        <>
          <div className="relative flex h-full flex-col justify-between p-6">
            <div className="space-y-3">
              <div className="h-3 w-16 rounded bg-slate-300/80" />
              <div className="h-6 w-4/5 max-w-[280px] rounded-md bg-slate-300/90" />
              <div className="h-4 w-full max-w-[320px] rounded bg-slate-200/90" />
              <div className="h-4 w-11/12 max-w-[300px] rounded bg-slate-200/80" />
              <div className="h-4 w-2/3 max-w-[200px] rounded bg-slate-200/70" />
            </div>
            <div className="flex items-end justify-between">
              <div className="h-3 w-12 rounded bg-slate-300/70" />
              <div className="h-3 w-16 rounded bg-slate-300/70" />
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 border-t border-slate-200/80 bg-white/85 px-4 py-2.5 backdrop-blur-sm">
            <p
              className={`text-center text-xs font-medium ${
                status === "error" ? "text-red-600" : "text-slate-600"
              }`}
            >
              {label}
            </p>
          </div>
        </>
      )}
      {status === "rendering" && !showRing && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -inset-full animate-shimmer bg-gradient-to-r from-transparent via-white/50 to-transparent" />
        </div>
      )}
    </div>
  );
}
