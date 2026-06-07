"use client";

import type { CarouselSlide } from "@/lib/types";

interface LinkedInSlideCardProps {
  slide: CarouselSlide;
  topic?: string;
  totalSlides: number;
}

export function LinkedInSlideCard({
  slide,
  topic,
  totalSlides,
}: LinkedInSlideCardProps) {
  const isCover = slide.index === 0;

  return (
    <div
      className={`flex h-64 w-full flex-col justify-between rounded-lg p-6 text-white ${
        isCover
          ? "bg-gradient-to-br from-slate-800 via-linkedin to-blue-600"
          : "bg-gradient-to-br from-slate-700 to-slate-900"
      }`}
    >
      {isCover && topic && (
        <p className="text-xs font-medium text-white/80">
          {topic} · {totalSlides} pages
        </p>
      )}
      <div>
        <h4 className="text-lg font-bold leading-tight">{slide.title}</h4>
        <p className="mt-2 text-sm leading-relaxed text-white/90">
          {slide.body}
        </p>
      </div>
      {isCover && (
        <p className="self-end text-xs font-medium text-white/70">Swipe →</p>
      )}
    </div>
  );
}
