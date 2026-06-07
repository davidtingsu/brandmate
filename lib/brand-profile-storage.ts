import type { BrandProfile } from "@/lib/types";

export const PROFILE_STORAGE_KEY = "brandmate.profile";
export const ONBOARDED_COOKIE = "brandmate_onboarded";

const EMPTY_PROFILE: BrandProfile = {
  name: "",
  niche: "",
  audience: "",
  voice: "",
};

export function isProfileComplete(
  profile: BrandProfile | null | undefined
): boolean {
  return Boolean(profile?.name?.trim() && profile?.niche?.trim());
}

export function loadStoredProfile(): BrandProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BrandProfile;
    return isProfileComplete(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveStoredProfile(profile: BrandProfile): void {
  if (typeof window === "undefined") return;
  if (!isProfileComplete(profile)) return;
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

export function clearStoredProfile(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PROFILE_STORAGE_KEY);
}

export function setOnboardedCookie(): void {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${ONBOARDED_COOKIE}=1; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearOnboardedCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${ONBOARDED_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

export function getEmptyProfile(): BrandProfile {
  return { ...EMPTY_PROFILE };
}
