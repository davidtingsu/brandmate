"use client";

import {
  PostGalleryCard,
  galleryTitleFromTopic,
} from "@/components/posts/PostGalleryCard";
import type { SimilarPost } from "@/lib/types";
import { useRouter } from "next/navigation";

interface SimilarPostsSectionProps {
  similarPosts: SimilarPost[];
}

export function SimilarPostsSection({ similarPosts }: SimilarPostsSectionProps) {
  const router = useRouter();

  if (similarPosts.length === 0) return null;

  return (
    <section className="mt-8 border-t border-slate-200 pt-6">
      <h2 className="mb-4 text-sm font-semibold text-slate-800">
        Similar posts
      </h2>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {similarPosts.map((post) => (
          <li key={post.id}>
            <PostGalleryCard
              title={galleryTitleFromTopic(post.topic)}
              previewImageUrl={post.previewImageUrl}
              previewText={post.previewText ?? post.hook}
              createdAt={post.createdAt}
              onClick={() => {
                if (post.sessionId) {
                  router.push(`/preview/${post.sessionId}`);
                }
              }}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
