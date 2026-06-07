"use client";

import { PostBrandingOverlay } from "@/components/linkedin/PostBrandingOverlay";
import { formatPostForDisplay } from "@/lib/linkedin-format";
import type { BrandProfile, LinkedInPost, PostBrandingOptions } from "@/lib/types";
import { LinkedInCaption } from "./LinkedInCaption";
import { LinkedInEngagementBar } from "./LinkedInEngagementBar";
import { LinkedInPostHeader } from "./LinkedInPostHeader";

interface LinkedInTextPreviewProps {
  post: LinkedInPost;
  profile: BrandProfile;
  branding?: PostBrandingOptions;
}

export function LinkedInTextPreview({
  post,
  profile,
  branding,
}: LinkedInTextPreviewProps) {
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
          {branding && (
            <PostBrandingOverlay
              profile={profile}
              branding={branding}
              className="absolute bottom-3 left-3"
            />
          )}
        </div>
      )}
      <div className="p-4">
        <LinkedInEngagementBar />
      </div>
    </div>
  );
}
