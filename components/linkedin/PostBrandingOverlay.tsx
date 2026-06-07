"use client";

import { formatHandle, profileInitials } from "@/lib/branding";
import type { BrandProfile, PostBrandingOptions } from "@/lib/types";

interface PostBrandingOverlayProps {
  profile: BrandProfile;
  branding?: PostBrandingOptions;
  className?: string;
}

export function PostBrandingOverlay({
  profile,
  branding,
  className = "",
}: PostBrandingOverlayProps) {
  if (!branding) return null;

  const handle = branding.includeHandle ? formatHandle(profile.handle) : null;
  const showPhoto = branding.includeProfileImage;

  if (!handle && !showPhoto) return null;

  return (
    <div
      className={`flex items-center gap-2 rounded-lg bg-black/45 px-3 py-1.5 backdrop-blur-sm ${className}`}
    >
      {showPhoto &&
        (profile.profileImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.profileImageUrl}
            alt={profile.name || "Profile"}
            className="h-7 w-7 shrink-0 rounded-full object-cover ring-2 ring-white/30"
          />
        ) : (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-linkedin text-xs font-bold text-white">
            {profileInitials(profile.name || "BM")}
          </span>
        ))}
      {handle && (
        <span className="text-sm font-semibold text-white">{handle}</span>
      )}
    </div>
  );
}
