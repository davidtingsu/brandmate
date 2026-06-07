"use client";

import { ImageGeneratingPlaceholder } from "@/components/linkedin/ImageGeneratingPlaceholder";
import { LinkedInCarouselPreview } from "@/components/linkedin/LinkedInCarouselPreview";
import { LinkedInTextPreview } from "@/components/linkedin/LinkedInTextPreview";
import { formatPostForDisplay } from "@/lib/linkedin-format";
import type {
  BrandProfile,
  LinkedInPost,
  PostBrandingOptions,
} from "@/lib/types";
import { useState } from "react";

interface PostCardProps {
  variants: LinkedInPost[];
  brandProfile: BrandProfile;
  topic?: string;
  branding?: PostBrandingOptions;
  onCopy?: (text: string) => void;
  loadingImageProgress?: number;
  loadingTimeRemaining?: string;
  slideImageProgress?: number;
}

type Tab = "preview" | "raw";

export function PostCard({
  variants,
  brandProfile,
  topic,
  branding,
  onCopy,
  loadingImageProgress,
  loadingTimeRemaining,
  slideImageProgress,
}: PostCardProps) {
  const [tab, setTab] = useState<Tab>("preview");
  const post = variants[0];

  if (!post) return null;

  const text = formatPostForDisplay(post);
  const slides = post.slides ?? [];
  const allSlidesRendered =
    post.format === "carousel" &&
    slides.length > 0 &&
    slides.every((s) => s.imageUrl);

  const downloadDiagram = async () => {
    if (!post.image?.url) return;
    const res = await fetch(post.image.url);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "system-diagram.png";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadSlides = async () => {
    for (const slide of slides) {
      if (!slide.imageUrl) continue;
      const res = await fetch(slide.imageUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `carousel-slide-${slide.index + 1}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="my-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-800">LinkedIn Post</h3>
        <div className="flex rounded-lg bg-slate-100 p-0.5">
          {(["preview", "raw"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-md px-2 py-0.5 text-xs font-medium capitalize ${
                tab === t
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === "preview" ? (
        <div className="space-y-3">
          {post.format === "carousel" ? (
            <LinkedInCarouselPreview
              post={post}
              profile={brandProfile}
              topic={topic}
              branding={branding}
              slideImageProgress={slideImageProgress}
              slideTimeRemaining={loadingTimeRemaining}
            />
          ) : (
            <>
              <LinkedInTextPreview
                post={post}
                profile={brandProfile}
                branding={branding}
              />
              {loadingImageProgress !== undefined && !post.image?.url && (
                <ImageGeneratingPlaceholder
                  progress={loadingImageProgress}
                  timeRemaining={loadingTimeRemaining ?? ""}
                />
              )}
            </>
          )}
        </div>
      ) : (
        <pre className="whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">
          {text}
        </pre>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <span>
          {post.characterCount} chars · {post.postType} · {post.format}
          {post.image ? " · image" : ""}
          {post.slides?.length ? ` · ${post.slides.length} slides` : ""}
          {post.format === "diagram" ? " · system diagram" : ""}
        </span>
        <div className="flex flex-wrap gap-2">
          {allSlidesRendered && (
            <button
              type="button"
              onClick={() => void downloadSlides()}
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Download slides
            </button>
          )}
          {post.format === "diagram" && post.image?.url && (
            <button
              type="button"
              onClick={() => void downloadDiagram()}
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Download diagram
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard.writeText(text);
              onCopy?.(text);
            }}
            className="rounded-md bg-linkedin px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
          >
            Copy post
          </button>
        </div>
      </div>
    </div>
  );
}
