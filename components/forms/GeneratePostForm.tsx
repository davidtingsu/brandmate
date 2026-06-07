"use client";

import type { PostBrandingOptions, PostFormat } from "@/lib/types";
import { useState } from "react";

export interface GeneratePostValues {
  topic: string;
  format: PostFormat;
  includeImage: boolean;
  slideCount: number;
  branding?: PostBrandingOptions;
}

interface GeneratePostFormProps {
  hasProfile: boolean;
  hasHandle?: boolean;
  hasProfileImage?: boolean;
  loading?: boolean;
  onSubmit: (values: GeneratePostValues) => Promise<void>;
}

export function GeneratePostForm({
  hasProfile,
  hasHandle = false,
  hasProfileImage = false,
  loading = false,
  onSubmit,
}: GeneratePostFormProps) {
  const [topic, setTopic] = useState("");
  const [format, setFormat] = useState<"text" | "image" | "carousel">("text");
  const [slideCount, setSlideCount] = useState(7);
  const [includeHandle, setIncludeHandle] = useState(true);
  const [includeProfileImage, setIncludeProfileImage] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const showBrandingToggles = format === "carousel" || format === "image";
  const brandingTarget = format === "carousel" ? "slides" : "image";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!topic.trim()) {
      setError("Enter a topic for your post.");
      return;
    }
    if (!hasProfile) {
      setError("Create your profile first.");
      return;
    }
    try {
      await onSubmit({
        topic: topic.trim(),
        format: format === "carousel" ? "carousel" : "text",
        includeImage: format === "image",
        slideCount,
        branding: showBrandingToggles
          ? { includeHandle, includeProfileImage }
          : undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    }
  };

  const formatBtn = (key: typeof format, label: string) => (
    <button
      key={key}
      type="button"
      onClick={() => setFormat(key)}
      className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
        format === key
          ? "bg-linkedin text-white"
          : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
  );

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <label className="mb-3 block">
        <span className="mb-1 block text-xs font-medium text-slate-600">
          Post topic
        </span>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. My transition from engineer to founder"
          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-linkedin focus:outline-none focus:ring-1 focus:ring-linkedin"
          disabled={loading}
        />
      </label>

      <div className="mb-3">
        <span className="mb-2 block text-xs font-medium text-slate-600">
          Format
        </span>
        <div className="flex flex-wrap gap-2">
          {formatBtn("text", "Text")}
          {formatBtn("image", "Post with Image")}
          {formatBtn("carousel", "Carousel")}
        </div>
      </div>

      {format === "carousel" && (
        <div className="mb-3 flex items-center gap-2 text-sm text-slate-600">
          <label htmlFor="slide-count">Slides:</label>
          <input
            id="slide-count"
            type="number"
            min={5}
            max={10}
            value={slideCount}
            onChange={(e) => setSlideCount(Number(e.target.value))}
            className="w-16 rounded border border-slate-200 px-2 py-1 text-sm"
            disabled={loading}
          />
        </div>
      )}

      {showBrandingToggles && (
        <div className="mb-3 space-y-2 rounded-lg border border-slate-100 bg-slate-50 p-3">
          <p className="text-xs font-medium text-slate-600">
            Branding on {brandingTarget}
          </p>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={includeHandle}
              onChange={(e) => setIncludeHandle(e.target.checked)}
              disabled={loading || !hasHandle}
              className="rounded border-slate-300 text-linkedin focus:ring-linkedin"
            />
            <span>
              Include handle
              {!hasHandle && (
                <span className="text-slate-400"> (add in profile)</span>
              )}
            </span>
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={includeProfileImage}
              onChange={(e) => setIncludeProfileImage(e.target.checked)}
              disabled={loading}
              className="rounded border-slate-300 text-linkedin focus:ring-linkedin"
            />
            <span>
              Include profile photo
              {!hasProfileImage && (
                <span className="text-slate-400">
                  {" "}
                  (uses initials if none set)
                </span>
              )}
            </span>
          </label>
        </div>
      )}

      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading || !hasProfile || !topic.trim()}
        className="w-full rounded-lg bg-linkedin px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {loading ? "Generating…" : "Generate"}
      </button>
    </form>
  );
}
