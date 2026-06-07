"use client";

import { CAROUSEL_EXAMPLE_PORTRAIT } from "@/lib/config";
import type { PostBrandingOptions, PostFormat } from "@/lib/types";
import { useRef, useState } from "react";

export interface GeneratePostValues {
  topic: string;
  format: PostFormat;
  includeImage: boolean;
  slideCount: number;
  portraitImageUrl?: string;
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
  const [portraitImageUrl, setPortraitImageUrl] = useState<string | undefined>();
  const [uploadingPortrait, setUploadingPortrait] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const portraitInputRef = useRef<HTMLInputElement>(null);

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
        portraitImageUrl:
          format === "carousel" ? portraitImageUrl : undefined,
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
      data-testid="generate-post-form"
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
        <>
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
          <div className="mb-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
            <p className="mb-2 text-xs font-medium text-slate-600">
              Portrait photo (4:5 recommended)
            </p>
            <div className="flex flex-wrap items-center gap-3">
              {portraitImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={portraitImageUrl}
                  alt="Portrait preview"
                  className="h-20 w-16 rounded-lg object-cover ring-2 ring-slate-200"
                />
              )}
              <input
                ref={portraitInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                disabled={loading || uploadingPortrait}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  void (async () => {
                    setUploadingPortrait(true);
                    setError(null);
                    try {
                      const formData = new FormData();
                      formData.append("file", file);
                      const res = await fetch("/api/agents/image", {
                        method: "POST",
                        body: formData,
                      });
                      if (!res.ok) throw new Error("Upload failed");
                      const { image } = (await res.json()) as {
                        image: { url: string };
                      };
                      setPortraitImageUrl(image.url);
                    } catch {
                      const reader = new FileReader();
                      reader.onload = () =>
                        setPortraitImageUrl(reader.result as string);
                      reader.readAsDataURL(file);
                    } finally {
                      setUploadingPortrait(false);
                      if (portraitInputRef.current) {
                        portraitInputRef.current.value = "";
                      }
                    }
                  })();
                }}
              />
              <button
                type="button"
                onClick={() => portraitInputRef.current?.click()}
                disabled={loading || uploadingPortrait}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                {uploadingPortrait ? "Uploading…" : "Upload portrait"}
              </button>
              <button
                type="button"
                onClick={() => setPortraitImageUrl(CAROUSEL_EXAMPLE_PORTRAIT)}
                disabled={loading}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-linkedin hover:bg-blue-50"
              >
                Use example
              </button>
              {portraitImageUrl && (
                <button
                  type="button"
                  onClick={() => setPortraitImageUrl(undefined)}
                  disabled={loading}
                  className="text-xs text-slate-500 hover:text-red-600"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </>
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
