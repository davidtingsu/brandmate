"use client";

import { LinkedInCaption } from "@/components/linkedin/LinkedInCaption";
import { LinkedInEngagementBar } from "@/components/linkedin/LinkedInEngagementBar";
import { LinkedInPostHeader } from "@/components/linkedin/LinkedInPostHeader";
import { PostBrandingOverlay } from "@/components/linkedin/PostBrandingOverlay";
import { formatPostForDisplay } from "@/lib/linkedin-format";
import type { BrandProfile, LinkedInPost, PostBrandingOptions } from "@/lib/types";
import { useRef, useState } from "react";

interface LinkedInFeedPostProps {
  post: LinkedInPost;
  profile: BrandProfile;
  topic?: string;
  branding?: PostBrandingOptions;
}

export function LinkedInFeedPost({
  post,
  profile,
  topic,
  branding,
}: LinkedInFeedPostProps) {
  const slides = post.slides ?? [];
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const caption = formatPostForDisplay({
    ...post,
    slides: undefined,
  });

  const goTo = (index: number) => {
    const next = Math.max(0, Math.min(slides.length - 1, index));
    setActiveIndex(next);
    const el = scrollRef.current?.children[next] as HTMLElement | undefined;
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="space-y-3 p-4">
        <LinkedInPostHeader profile={profile} />
        <LinkedInCaption text={caption} />
      </div>

      {post.image?.url && (
        <div className="relative w-full bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.image.url}
            alt={post.image.alt ?? "Post image"}
            className="h-auto w-full object-cover"
          />
          {branding && (
            <PostBrandingOverlay
              profile={profile}
              branding={branding}
              className="absolute bottom-3 left-3"
            />
          )}
        </div>
      )}

      {post.format === "carousel" && slides.length > 0 && (
        <div className="bg-[#f3f2ef] px-2 pb-2 pt-1">
          <div
            ref={scrollRef}
            className="flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth px-1"
          >
            {slides.map((slide) => (
              <div
                key={slide.index}
                className="w-[88%] shrink-0 snap-center sm:w-[80%]"
              >
                <div
                  className={`relative flex h-56 flex-col justify-between overflow-hidden rounded-lg p-5 text-white ${
                    slide.index === 0
                      ? "bg-gradient-to-br from-slate-800 via-linkedin to-blue-600"
                      : "bg-gradient-to-br from-slate-700 to-slate-900"
                  }`}
                >
                  <div>
                    {slide.index === 0 && topic && (
                      <p className="mb-2 text-xs text-white/80">
                        {topic} · {slides.length} pages
                      </p>
                    )}
                    <h4 className="text-base font-bold leading-tight">
                      {slide.title}
                    </h4>
                    <p className="mt-2 text-sm leading-relaxed text-white/90">
                      {slide.body}
                    </p>
                  </div>
                  {branding && (
                    <PostBrandingOverlay
                      profile={profile}
                      branding={branding}
                      className="mt-3 self-start"
                    />
                  )}
                </div>
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

      <div className="px-4 pb-4">
        <LinkedInEngagementBar />
      </div>
    </article>
  );
}
