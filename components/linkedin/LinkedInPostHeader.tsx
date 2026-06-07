"use client";

import { formatHandle, profileInitials } from "@/lib/branding";
import type { BrandProfile } from "@/lib/types";

interface LinkedInPostHeaderProps {
  profile: BrandProfile;
}

export function LinkedInPostHeader({ profile }: LinkedInPostHeaderProps) {
  const handle = formatHandle(profile.handle);

  return (
    <div className="flex items-start gap-3">
      {profile.profileImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={profile.profileImageUrl}
          alt={profile.name || "Profile"}
          className="h-12 w-12 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-linkedin text-sm font-bold text-white">
          {profileInitials(profile.name || "BM")}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <span className="truncate text-sm font-semibold text-slate-900">
            {profile.name || "Your Name"}
          </span>
          <span className="text-xs text-slate-500">· 1st</span>
        </div>
        <p className="truncate text-xs text-slate-600">
          {handle ?? profile.niche ?? "Professional"}
        </p>
        <p className="text-xs text-slate-500">
          Just now · <span aria-hidden>🌐</span>
        </p>
      </div>
    </div>
  );
}
