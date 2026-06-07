"use client";

import { useRef, useState } from "react";
import type { BrandProfile, LinkedInPost, PostBrandingOptions } from "@/lib/types";
import { LinkedInCaption } from "./LinkedInCaption";
import { LinkedInEngagementBar } from "./LinkedInEngagementBar";
import { LinkedInPostHeader } from "./LinkedInPostHeader";
import { LinkedInSlideCard } from "./LinkedInSlideCard";

interface LinkedInCarouselPreviewProps {
  post: LinkedInPost;
  profile: BrandProfile;
  topic?: string;
  branding?: PostBrandingOptions;
}

export function LinkedInCarouselPreview({
  post,
  profile,
  topic,
  branding,
}: LinkedInCarouselPreviewProps) {
  const slides = post.slides ?? [];
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const caption = [post.hook, post.body].filter(Boolean).join("\n\n");

  const goTo = (index: number) => {
    const next = Math.max(0, Math.min(slides.length - 1, index));
    setActiveIndex(next);
    const el = scrollRef.current?.children[next] as HTMLElement | undefined;
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="space-y-3 p-4">
        <LinkedInPostHeader profile={profile} />
        <LinkedInCaption text={caption} maxLines={2} />
      </div>

      {slides.length > 0 && (
        <div className="relative bg-slate-50 px-2 pb-2">
          <div
            ref={scrollRef}
            className="flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth px-2"
          >
            {slides.map((slide) => (
              <div
                key={slide.index}
                className="w-[85%] shrink-0 snap-center sm:w-[75%]"
              >
                <LinkedInSlideCard
                  slide={slide}
                  topic={topic}
                  totalSlides={slides.length}
                  profile={profile}
                  branding={branding}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between px-2">
            <button
              type="button"
              onClick={() => goTo(activeIndex - 1)}
              disabled={activeIndex === 0}
              className="rounded-full bg-white px-3 py-1 text-sm shadow disabled:opacity-40"
              aria-label="Previous slide"
            >
              ←
            </button>
            <span className="text-xs text-slate-600">
              {activeIndex + 1} / {slides.length}
            </span>
            <button
              type="button"
              onClick={() => goTo(activeIndex + 1)}
              disabled={activeIndex >= slides.length - 1}
              className="rounded-full bg-white px-3 py-1 text-sm shadow disabled:opacity-40"
              aria-label="Next slide"
            >
              →
            </button>
          </div>
        </div>
      )}

      <div className="p-4">
        <LinkedInEngagementBar />
      </div>
    </div>
  );
}
