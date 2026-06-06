"use client";

import { formatPostForDisplay } from "@/lib/linkedin-format";
import type { LinkedInPost } from "@/lib/types";
import { useState } from "react";

interface PostCardProps {
  variants: LinkedInPost[];
  onCopy?: (text: string) => void;
}

export function PostCard({ variants, onCopy }: PostCardProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const post = variants[activeIndex];

  if (!post) return null;

  const text = formatPostForDisplay(post);

  return (
    <div className="my-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">LinkedIn Post</h3>
        <div className="flex gap-1">
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
      <pre className="whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">
        {text}
      </pre>
      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <span>{post.characterCount} chars · {post.postType}</span>
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
