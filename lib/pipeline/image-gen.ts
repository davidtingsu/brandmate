import { IMAGE_MODEL, SUPABASE_STORAGE_BUCKET } from "@/lib/config";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { BrandProfile, PostImage } from "@/lib/types";
import { getOpenAI } from "@/lib/weave/openai";

export async function generatePostImageCore(input: {
  topic: string;
  hook: string;
  body: string;
  brandProfile: BrandProfile;
  imageStyle?: string;
}): Promise<PostImage> {
  const openai = getOpenAI();
  const styleHint = input.imageStyle
    ? `Style: ${input.imageStyle}.`
    : "Professional LinkedIn-style visual.";

  const prompt = `${styleHint} Topic: ${input.topic}. Key message: ${input.hook}. Create a clean, readable image suitable for a LinkedIn post — no text watermarks. Brand niche: ${input.brandProfile.niche}.`;

  const response = await openai.images.generate({
    model: IMAGE_MODEL,
    prompt,
    n: 1,
    size: "1536x1024",
    quality: "high",
  });

  const b64 = response.data?.[0]?.b64_json;
  if (!b64) throw new Error("Image generation returned no data");

  const buffer = Buffer.from(b64, "base64");
  const filename = `post-${Date.now()}.png`;

  if (isSupabaseConfigured()) {
    const supabase = createServerClient();
    const path = `generated/${filename}`;
    const { error } = await supabase.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .upload(path, buffer, {
        contentType: "image/png",
        upsert: false,
      });
    if (error) throw new Error(`Storage upload failed: ${error.message}`);

    const { data } = supabase.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .getPublicUrl(path);

    return {
      url: data.publicUrl,
      alt: `Image for: ${input.topic}`,
      aspectRatio: "1.91:1",
      source: "generated",
    };
  }

  return {
    url: `data:image/png;base64,${b64}`,
    alt: `Image for: ${input.topic}`,
    aspectRatio: "1.91:1",
    source: "generated",
  };
}

export async function uploadPostImage(
  file: Buffer,
  contentType: string,
  filename: string
): Promise<PostImage> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase not configured for image upload");
  }

  const supabase = createServerClient();
  const path = `uploads/${Date.now()}-${filename}`;
  const { error } = await supabase.storage
    .from(SUPABASE_STORAGE_BUCKET)
    .upload(path, file, { contentType, upsert: false });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data } = supabase.storage
    .from(SUPABASE_STORAGE_BUCKET)
    .getPublicUrl(path);

  return {
    url: data.publicUrl,
    alt: filename,
    aspectRatio: "1.91:1",
    source: "uploaded",
  };
}
