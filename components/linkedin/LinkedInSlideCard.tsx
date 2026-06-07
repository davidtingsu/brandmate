"use client";

import { CarouselSlideSkeleton } from "@/components/linkedin/CarouselSlideSkeleton";
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
  const isGenerating =
    !slide.imageUrl &&
    (slide.pngStatus === "pending" ||
      slide.pngStatus === "rendering" ||
      slide.pngStatus === "error");

  if (isGenerating) {
    return (
      <CarouselSlideSkeleton
        slideIndex={slide.index}
        totalSlides={totalSlides}
        status={
          slide.pngStatus === "error"
            ? "error"
            : slide.pngStatus === "rendering"
              ? "rendering"
              : "pending"
        }
      />
    );
  }

  if (slide.imageUrl) {
    return (
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={slide.imageUrl}
          alt={`Slide ${slide.index + 1}: ${slide.title}`}
          className="h-full w-full object-cover"
        />
        {branding && profile && (
          <PostBrandingOverlay
            profile={profile}
            branding={branding}
            className="absolute bottom-3 left-3"
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative flex aspect-[4/5] w-full flex-col justify-between overflow-hidden rounded-lg p-6 text-white ${
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
