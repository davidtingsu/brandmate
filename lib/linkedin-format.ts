import type { LinkedInPost } from "./types";

export function formatPostForDisplay(post: LinkedInPost): string {
  const tags = post.hashtags.map((t) => (t.startsWith("#") ? t : `#${t}`)).join(" ");
  return [post.hook, "", post.body, "", post.cta, "", tags]
    .filter(Boolean)
    .join("\n");
}

export function computeCharacterCount(parts: {
  hook: string;
  body: string;
  cta: string;
  hashtags: string[];
}): number {
  const tags = parts.hashtags.join(" ");
  return [parts.hook, parts.body, parts.cta, tags].join(" ").length;
}

export function buildLinkedInPost(raw: {
  hook: string;
  body: string;
  cta?: string;
  hashtags?: string[];
  postType: string;
}): LinkedInPost {
  const hashtags = raw.hashtags ?? [];
  const cta = raw.cta ?? "";
  return {
    hook: raw.hook,
    body: raw.body,
    cta,
    hashtags,
    postType: raw.postType as LinkedInPost["postType"],
    characterCount: computeCharacterCount({
      hook: raw.hook,
      body: raw.body,
      cta,
      hashtags,
    }),
  };
}
