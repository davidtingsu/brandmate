import { isProfileComplete } from "@/lib/brand-profile-storage";
import type { BrandProfile, ChatMessage, PostAttempt, PostBrandingOptions } from "@/lib/types";

const PREVIEW_PROFILE_FALLBACK: BrandProfile = {
  name: "Your Name",
  niche: "Professional",
  audience: "",
  voice: "",
};

export interface ApprovedPostRecord {
  attempt: PostAttempt;
  variantIndex: number;
  branding?: PostBrandingOptions;
  approvedAt: string;
}

export function findBrandProfile(messages: ChatMessage[]): BrandProfile | null {
  const meta = messages.find((m) => m.metadata?.type === "brand_profile");
  if (!meta?.metadata?.profile) return null;
  return meta.metadata.profile as BrandProfile;
}

/** Session profile first, then client-stored profile (onboard / ProfileForm). */
export function resolvePreviewBrandProfile(
  sessionProfile: BrandProfile | null,
  storedProfile?: BrandProfile | null
): BrandProfile {
  if (sessionProfile && isProfileComplete(sessionProfile)) return sessionProfile;
  if (storedProfile && isProfileComplete(storedProfile)) return storedProfile;
  return PREVIEW_PROFILE_FALLBACK;
}

export function findApprovedPost(
  messages: ChatMessage[]
): ApprovedPostRecord | null {
  const approved = [...messages]
    .reverse()
    .find((m) => m.metadata?.type === "approved_post");
  if (!approved?.metadata?.attempt) return null;

  return {
    attempt: approved.metadata.attempt as PostAttempt,
    variantIndex: (approved.metadata.variantIndex as number) ?? 0,
    branding: approved.metadata.branding as PostBrandingOptions | undefined,
    approvedAt: (approved.metadata.approvedAt as string) ?? approved.created_at,
  };
}

export interface PostAttemptRecord {
  attempt: PostAttempt;
  weaveTraceId?: string;
}

export function findAllPostAttempts(
  messages: ChatMessage[]
): PostAttemptRecord[] {
  return messages
    .filter((m) => m.metadata?.type === "post_attempt" && m.metadata?.attempt)
    .map((m) => ({
      attempt: m.metadata!.attempt as PostAttempt,
      weaveTraceId: m.metadata!.weaveTraceId as string | undefined,
    }));
}

export function findLatestPostAttempt(
  messages: ChatMessage[]
): PostAttemptRecord | null {
  return findAllPostAttempts(messages).at(-1) ?? null;
}

export function resolvePreviewPost(messages: ChatMessage[]): {
  profile: BrandProfile | null;
  approved: ApprovedPostRecord | null;
  latest: { attempt: PostAttempt; weaveTraceId?: string } | null;
} {
  return {
    profile: findBrandProfile(messages),
    approved: findApprovedPost(messages),
    latest: findLatestPostAttempt(messages),
  };
}

export function hasApprovedPost(messages: ChatMessage[]): boolean {
  return messages.some((m) => m.metadata?.type === "approved_post");
}
