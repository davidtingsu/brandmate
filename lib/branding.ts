import type { BrandProfile } from "@/lib/types";

export function formatHandle(handle?: string): string | null {
  if (!handle?.trim()) return null;
  const trimmed = handle.trim();
  return trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
}

export function profileInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function hasBrandingContent(
  profile: BrandProfile,
  options?: { includeHandle?: boolean; includeProfileImage?: boolean }
): boolean {
  if (!options) return false;
  return Boolean(
    (options.includeHandle && formatHandle(profile.handle)) ||
      (options.includeProfileImage && profile.profileImageUrl)
  );
}
