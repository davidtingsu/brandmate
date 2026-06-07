import type { BrandProfile, ChatMessage, PostAttempt, PostBrandingOptions } from "@/lib/types";

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

export function findLatestPostAttempt(
  messages: ChatMessage[]
): { attempt: PostAttempt; weaveTraceId?: string } | null {
  const attempts = messages.filter((m) => m.metadata?.type === "post_attempt");
  const latest = attempts[attempts.length - 1];
  if (!latest?.metadata?.attempt) return null;

  return {
    attempt: latest.metadata.attempt as PostAttempt,
    weaveTraceId: latest.metadata.weaveTraceId as string | undefined,
  };
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
