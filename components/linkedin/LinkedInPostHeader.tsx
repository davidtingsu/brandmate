"use client";

import type { BrandProfile } from "@/lib/types";

interface LinkedInPostHeaderProps {
  profile: BrandProfile;
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function LinkedInPostHeader({ profile }: LinkedInPostHeaderProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-linkedin text-sm font-bold text-white">
        {initials(profile.name || "BM")}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <span className="truncate text-sm font-semibold text-slate-900">
            {profile.name || "Your Name"}
          </span>
          <span className="text-xs text-slate-500">· 1st</span>
        </div>
        <p className="truncate text-xs text-slate-600">
          {profile.niche || "Professional"}
        </p>
        <p className="text-xs text-slate-500">
          Just now · <span aria-hidden>🌐</span>
        </p>
      </div>
    </div>
  );
}
