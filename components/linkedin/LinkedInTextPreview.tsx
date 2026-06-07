"use client";

import type { BrandProfile, LinkedInPost } from "@/lib/types";
import { formatPostForDisplay } from "@/lib/linkedin-format";
import { LinkedInCaption } from "./LinkedInCaption";
import { LinkedInEngagementBar } from "./LinkedInEngagementBar";
import { LinkedInPostHeader } from "./LinkedInPostHeader";

interface LinkedInTextPreviewProps {
  post: LinkedInPost;
  profile: BrandProfile;
}

export function LinkedInTextPreview({ post, profile }: LinkedInTextPreviewProps) {
  const caption = formatPostForDisplay({
    ...post,
    slides: undefined,
  });

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="space-y-3 p-4">
        <LinkedInPostHeader profile={profile} />
        <LinkedInCaption text={caption} />
      </div>
      {post.image?.url && (
        <div className="relative w-full bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.image.url}
            alt={post.image.alt ?? "Post image"}
            className="h-auto w-full object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <LinkedInEngagementBar />
      </div>
    </div>
  );
}
