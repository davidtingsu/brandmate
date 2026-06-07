import {
  buildSlideOverlaySvg,
  gradientBackgroundSvg,
  usesPortraitBackground,
} from "@/lib/carousel/templates";
import { CAROUSEL_PORTRAIT_SIZE, SUPABASE_STORAGE_BUCKET } from "@/lib/config";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type {
  BrandProfile,
  CarouselSlide,
  PostBrandingOptions,
} from "@/lib/types";
import sharp from "sharp";

const { width: W, height: H } = CAROUSEL_PORTRAIT_SIZE;

async function loadImageBuffer(url: string): Promise<Buffer> {
  if (url.startsWith("data:")) {
    const base64 = url.split(",")[1];
    if (!base64) throw new Error("Invalid data URL");
    return Buffer.from(base64, "base64");
  }
  if (url.startsWith("/")) {
    const { readFile } = await import("fs/promises");
    const { join } = await import("path");
    const path = join(process.cwd(), "public", url.replace(/^\//, ""));
    return readFile(path);
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function uploadSlidePng(buffer: Buffer, filename: string): Promise<string> {
  if (isSupabaseConfigured()) {
    const supabase = createServerClient();
    const path = `carousel/${filename}`;
    const { error } = await supabase.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .upload(path, buffer, {
        contentType: "image/png",
        upsert: true,
      });
    if (error) throw new Error(`Storage upload failed: ${error.message}`);
    const { data } = supabase.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .getPublicUrl(path);
    return data.publicUrl;
  }
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

export async function renderSlidePng(input: {
  slide: CarouselSlide;
  portraitImageUrl?: string;
  topic?: string;
  brandProfile?: BrandProfile;
  branding?: PostBrandingOptions;
  totalSlides: number;
}): Promise<string> {
  const layout = input.slide.layout ?? "template_content";
  const hasPortrait = Boolean(input.portraitImageUrl);
  const usePortrait = usesPortraitBackground(layout, hasPortrait);

  let background: sharp.Sharp;

  if (usePortrait && input.portraitImageUrl) {
    const portraitBuf = await loadImageBuffer(input.portraitImageUrl);
    background = sharp(portraitBuf).resize(W, H, { fit: "cover" });
  } else if (layout === "split_before_after") {
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  ${gradientBackgroundSvg(layout)}
</svg>`;
    background = sharp(Buffer.from(svg));
  } else {
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1e3a5f"/>
      <stop offset="45%" style="stop-color:#0a66c2"/>
      <stop offset="100%" style="stop-color:#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
</svg>`;
    background = sharp(Buffer.from(svg));
  }

  if (usePortrait) {
    const tintSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="rgba(0,0,0,0.35)"/>
</svg>`;
    background = sharp(await background.toBuffer()).composite([
      { input: Buffer.from(tintSvg), blend: "over" },
    ]);
  }

  const handle =
    input.branding?.includeHandle && input.brandProfile?.handle
      ? input.brandProfile.handle
      : undefined;

  const overlaySvg = buildSlideOverlaySvg({
    title: input.slide.title,
    body: input.slide.body,
    layout,
    handle: layout === "portrait_cta" ? handle : undefined,
    slideIndex: input.slide.index,
    totalSlides: input.totalSlides,
  });

  const pngBuffer = await background
    .composite([{ input: Buffer.from(overlaySvg), blend: "over" }])
    .png()
    .toBuffer();

  const filename = `slide-${Date.now()}-${input.slide.index}.png`;
  return uploadSlidePng(pngBuffer, filename);
}
