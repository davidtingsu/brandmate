"use client";

import { LinkedInFeedPage } from "@/components/feed/LinkedInFeedPage";
import { useBrandProfile } from "@/contexts/BrandProfileContext";
import { loadStoredProfile } from "@/lib/brand-profile-storage";
import {
  findApprovedPost,
  findBrandProfile,
  findLatestPostAttempt,
  resolvePreviewBrandProfile,
} from "@/lib/sessions/approved-post";
import type {
  BrandProfile,
  ChatMessage,
  Lesson,
  SimilarPost,
} from "@/lib/types";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PreviewPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const { brandProfile } = useBrandProfile();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<BrandProfile>(() =>
    resolvePreviewBrandProfile(null, loadStoredProfile() ?? brandProfile)
  );
  const [post, setPost] = useState<import("@/lib/types").LinkedInPost | null>(
    null
  );
  const [topic, setTopic] = useState<string | undefined>();
  const [branding, setBranding] = useState<
    import("@/lib/types").PostBrandingOptions | undefined
  >();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [similarPosts, setSimilarPosts] = useState<SimilarPost[]>([]);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/sessions/${sessionId}/messages`);
        if (!res.ok) throw new Error("Could not load post");
        const { messages } = (await res.json()) as { messages: ChatMessage[] };

        const loadedProfile = resolvePreviewBrandProfile(
          findBrandProfile(messages),
          loadStoredProfile() ?? brandProfile
        );
        const approved = findApprovedPost(messages);
        const latest = findLatestPostAttempt(messages);
        const source = approved ?? latest;

        if (!source?.attempt?.variants?.length) {
          setError("No post found for this session.");
          return;
        }

        const variantIndex = approved?.variantIndex ?? 0;
        const variant =
          source.attempt.variants[variantIndex] ??
          source.attempt.variants[0];

        const resolvedTopic = source.attempt.topic;
        const resolvedNiche = loadedProfile.niche;
        const postType = variant.postType;

        setProfile(loadedProfile);
        setPost(variant);
        setTopic(resolvedTopic);
        setBranding(
          approved?.branding ??
            source.attempt.branding ??
            undefined
        );

        const [lessonsRes, postsRes] = await Promise.all([
          fetch("/api/memory/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query: resolvedTopic,
              niche: resolvedNiche,
              postType,
            }),
          }).catch(() => null),
          fetch("/api/memory/search-posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              topic: resolvedTopic,
              hook: variant.hook,
              body: variant.body,
              niche: resolvedNiche,
              excludeSessionId: sessionId,
            }),
          }).catch(() => null),
        ]);

        if (lessonsRes?.ok) {
          const data = (await lessonsRes.json()) as { lessons?: Lesson[] };
          setLessons(data.lessons ?? []);
        } else {
          setLessons([]);
        }

        if (postsRes?.ok) {
          const data = (await postsRes.json()) as {
            similarPosts?: SimilarPost[];
          };
          setSimilarPosts(
            (data.similarPosts ?? []).filter((p) => p.sessionId)
          );
        } else {
          setSimilarPosts([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load preview");
      } finally {
        setLoading(false);
      }
    })();
  }, [sessionId, brandProfile]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f3f2ef] text-sm text-slate-500">
        Loading preview…
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#f3f2ef] p-6 text-center">
        <p className="text-sm text-slate-600">{error ?? "Post not found."}</p>
        <Link href="/" className="text-sm font-medium text-linkedin hover:text-blue-700">
          Back to posts
        </Link>
      </main>
    );
  }

  return (
    <LinkedInFeedPage
      profile={profile}
      post={post}
      topic={topic}
      branding={branding}
      lessons={lessons}
      similarPosts={similarPosts}
    />
  );
}
