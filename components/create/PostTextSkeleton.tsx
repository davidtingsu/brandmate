"use client";

import { LinkedInPostHeader } from "@/components/linkedin/LinkedInPostHeader";
import type { BrandProfile } from "@/lib/types";

interface PostTextSkeletonProps {
  profile: BrandProfile;
}

export function PostTextSkeleton({ profile }: PostTextSkeletonProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="space-y-3 p-4">
        <LinkedInPostHeader profile={profile} />
        <div className="space-y-2">
          <div className="h-4 w-full max-w-md animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-11/12 max-w-sm animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-4/5 max-w-xs animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-2/3 max-w-[200px] animate-pulse rounded bg-slate-100" />
        </div>
      </div>
    </div>
  );
}
