"use client";

import { LinkedInFeedPost } from "@/components/feed/LinkedInFeedPost";
import { RetrievedLessonsSection } from "@/components/feed/RetrievedLessonsSection";
import { SimilarPostsSection } from "@/components/feed/SimilarPostsSection";
import type {
  BrandProfile,
  Lesson,
  LinkedInPost,
  PostBrandingOptions,
  SimilarPost,
} from "@/lib/types";
import { useRouter } from "next/navigation";

interface LinkedInFeedPageProps {
  profile: BrandProfile;
  post: LinkedInPost;
  topic?: string;
  branding?: PostBrandingOptions;
  lessons?: Lesson[];
  similarPosts?: SimilarPost[];
  sessionId?: string;
}

export function LinkedInFeedPage({
  profile,
  post,
  topic,
  branding,
  lessons = [],
  similarPosts = [],
  sessionId,
}: LinkedInFeedPageProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f3f2ef]">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-[555px] items-center justify-between">
          <p className="text-sm font-semibold text-slate-800">LinkedIn feed preview</p>
          <div className="flex items-center gap-4">
            {sessionId ? (
              <button
                type="button"
                onClick={() =>
                  router.push(`/create?session=${sessionId}&studio=1`)
                }
                className="text-sm font-medium text-linkedin hover:text-blue-700"
              >
                Back to studio
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => router.push("/")}
              className="text-sm font-medium text-linkedin hover:text-blue-700"
            >
              Exit preview
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-4">
        <div className="mx-auto max-w-[555px]">
          <LinkedInFeedPost
            post={post}
            profile={profile}
            topic={topic}
            branding={branding}
          />
        </div>
        <RetrievedLessonsSection lessons={lessons} topic={topic} />
        <SimilarPostsSection similarPosts={similarPosts} />
      </main>
    </div>
  );
}
