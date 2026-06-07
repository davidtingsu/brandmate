"use client";

import { PostBrandingOverlay } from "@/components/linkedin/PostBrandingOverlay";
import type { BrandProfile, CarouselSlide, PostBrandingOptions } from "@/lib/types";

interface LinkedInSlideCardProps {
  slide: CarouselSlide;
  topic?: string;
  totalSlides: number;
  profile?: BrandProfile;
  branding?: PostBrandingOptions;
}

export function LinkedInSlideCard({
  slide,
  topic,
  totalSlides,
  profile,
  branding,
}: LinkedInSlideCardProps) {
  const isCover = slide.index === 0;

  return (
    <div
      className={`relative flex h-64 w-full flex-col justify-between overflow-hidden rounded-lg p-6 text-white ${
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
      <div className="flex items-end justify-between gap-2">
        {profile && branding ? (
          <PostBrandingOverlay profile={profile} branding={branding} />
        ) : (
          <span />
        )}
        {isCover && (
          <p className="shrink-0 text-xs font-medium text-white/70">Swipe →</p>
        )}
      </div>
    </div>
  );
}
