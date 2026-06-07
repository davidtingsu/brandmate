"use client";

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
}

type Tab = "preview" | "raw";

export function PostCard({
  variants,
  brandProfile,
  topic,
  branding,
  onCopy,
}: PostCardProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [tab, setTab] = useState<Tab>("preview");
  const post = variants[activeIndex];

  if (!post) return null;

  const text = formatPostForDisplay(post);

  return (
    <div className="my-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-800">LinkedIn Post</h3>
        <div className="flex flex-wrap gap-1">
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
          {variants.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`rounded px-2 py-0.5 text-xs font-medium ${
                i === activeIndex
                  ? "bg-linkedin text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              Variant {i === 0 ? "A" : "B"}
            </button>
          ))}
        </div>
      </div>

      {tab === "preview" ? (
        post.format === "carousel" ? (
          <LinkedInCarouselPreview
            post={post}
            profile={brandProfile}
            topic={topic}
            branding={branding}
          />
        ) : (
          <LinkedInTextPreview
            post={post}
            profile={brandProfile}
            branding={branding}
          />
        )
      ) : (
        <pre className="whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">
          {text}
        </pre>
      )}

      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <span>
          {post.characterCount} chars · {post.postType} · {post.format}
          {post.image ? " · image" : ""}
          {post.slides?.length ? ` · ${post.slides.length} slides` : ""}
        </span>
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
  );
}
