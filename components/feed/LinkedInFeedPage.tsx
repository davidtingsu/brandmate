"use client";

import { LinkedInFeedPost } from "@/components/feed/LinkedInFeedPost";
import type { BrandProfile, LinkedInPost, PostBrandingOptions } from "@/lib/types";
import { useRouter } from "next/navigation";

interface LinkedInFeedPageProps {
  profile: BrandProfile;
  post: LinkedInPost;
  topic?: string;
  branding?: PostBrandingOptions;
}

export function LinkedInFeedPage({
  profile,
  post,
  topic,
  branding,
}: LinkedInFeedPageProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f3f2ef]">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-[555px] items-center justify-between">
          <p className="text-sm font-semibold text-slate-800">LinkedIn feed preview</p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="text-sm font-medium text-linkedin hover:text-blue-700"
          >
            Exit preview
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[555px] px-2 py-4">
        <LinkedInFeedPost
          post={post}
          profile={profile}
          topic={topic}
          branding={branding}
        />
      </main>
    </div>
  );
}
