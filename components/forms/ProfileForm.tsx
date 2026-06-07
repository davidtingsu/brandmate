"use client";

import { BrandProfileCard } from "@/components/generative/BrandProfileCard";
import type { BrandProfile } from "@/lib/types";
import { useRef, useState } from "react";

interface ProfileFormProps {
  initial?: BrandProfile;
  onSubmit: (profile: BrandProfile) => Promise<void>;
  compact?: boolean;
}

const EMPTY: BrandProfile = {
  name: "",
  niche: "",
  audience: "",
  voice: "",
};

export function ProfileForm({
  initial,
  onSubmit,
  compact = false,
}: ProfileFormProps) {
  const [form, setForm] = useState<BrandProfile>(initial ?? EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saved, setSaved] = useState<BrandProfile | null>(
    initial?.name && initial?.niche ? initial : null
  );
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name.trim() || !form.niche.trim()) {
      setError("Name and niche are required.");
      return;
    }
    setSaving(true);
    try {
      await onSubmit(form);
      setSaved(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/agents/image", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const { image } = (await res.json()) as {
          image: { url: string };
        };
        setForm((prev) => ({ ...prev, profileImageUrl: image.url }));
      } else {
        const dataUrl = await readFileAsDataUrl(file);
        setForm((prev) => ({ ...prev, profileImageUrl: dataUrl }));
      }
    } catch {
      try {
        const dataUrl = await readFileAsDataUrl(file);
        setForm((prev) => ({ ...prev, profileImageUrl: dataUrl }));
      } catch {
        setError("Could not load profile image.");
      }
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const fieldClass =
    "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-linkedin focus:outline-none focus:ring-1 focus:ring-linkedin";

  return (
    <div
      className={
        compact
          ? ""
          : "rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      }
    >
      <h2 className="mb-1 text-base font-semibold text-slate-900">
        Tell me about yourself
      </h2>
      <p className="mb-4 text-sm text-slate-600">
        Set your brand profile so every draft matches your voice and audience.
      </p>

      {saved && (
        <div className="mb-4">
          <BrandProfileCard profile={saved} />
        </div>
      )}

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            {form.profileImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.profileImageUrl}
                alt="Profile preview"
                className="h-16 w-16 rounded-full object-cover ring-2 ring-slate-200"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-500">
                Photo
              </div>
            )}
          </div>
          <div className="space-y-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => void handleImageSelect(e)}
              className="hidden"
              id="profile-image-upload"
            />
            <label
              htmlFor="profile-image-upload"
              className="inline-block cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {uploadingImage ? "Uploading…" : "Add profile photo"}
            </label>
            {form.profileImageUrl && (
              <button
                type="button"
                onClick={() =>
                  setForm((prev) => ({ ...prev, profileImageUrl: undefined }))
                }
                className="block text-xs text-slate-500 hover:text-red-600"
              >
                Remove photo
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600">
              Name
            </span>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={fieldClass}
              placeholder="Your name"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600">
              LinkedIn handle
            </span>
            <input
              type="text"
              value={form.handle ?? ""}
              onChange={(e) => setForm({ ...form, handle: e.target.value })}
              className={fieldClass}
              placeholder="@yourname"
            />
          </label>
        </div>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">
            Niche
          </span>
          <input
            type="text"
            value={form.niche}
            onChange={(e) => setForm({ ...form, niche: e.target.value })}
            className={fieldClass}
            placeholder="e.g. AI engineering, founder"
            required
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">
            Target audience
          </span>
          <input
            type="text"
            value={form.audience}
            onChange={(e) => setForm({ ...form, audience: e.target.value })}
            className={fieldClass}
            placeholder="Who reads your posts?"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">
            Voice & tone
          </span>
          <input
            type="text"
            value={form.voice}
            onChange={(e) => setForm({ ...form, voice: e.target.value })}
            className={fieldClass}
            placeholder="e.g. Direct, story-driven, no fluff"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">
            Goals (optional)
          </span>
          <input
            type="text"
            value={form.goals ?? ""}
            onChange={(e) => setForm({ ...form, goals: e.target.value })}
            className={fieldClass}
            placeholder="What are you building your brand toward?"
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={saving || uploadingImage}
          className="rounded-lg bg-linkedin px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Create Profile"}
        </button>
      </form>
    </div>
  );
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
