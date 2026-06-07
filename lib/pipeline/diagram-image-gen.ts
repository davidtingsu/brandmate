import { IMAGE_MODEL, SUPABASE_STORAGE_BUCKET } from "@/lib/config";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { PostImage, SystemDiagram } from "@/lib/types";
import { getOpenAI } from "@/lib/weave/openai";
import { readFile } from "fs/promises";
import { join } from "path";
import { toFile } from "openai/uploads";

export const BYTEBYTEGO_REFERENCE_PATH =
  "public/examples/bytebytego-architecture-reference.png";

function diagramBrandingBlock(brandName: string): string {
  return `BRANDING — Image 1 may contain a ByteByteGo logo or watermark. Remove the ByteByteGo logo completely.
Do not include ByteByteGo branding anywhere in the output.
Place the brand name "${brandName}" in the same corner/area where the reference logo appeared
(clean text watermark or small title badge — match reference placement, not Uber content).`;
}

export function buildDiagramImagePrompt(
  diagram: SystemDiagram,
  brandName: string
): string {
  return `Image 1 is a ByteByteGo-style system architecture reference. Match its overall visual language:
layout density, shape types (boxes, cylinders, clouds, actors), dashed group borders, arrows
with labels, bold title placement, and color-coding approach — infer colors from Image 1 and
the architecture below; do not use a fixed color legend.

Create a NEW diagram for a different system. Do not copy the Uber content from Image 1.

${diagramBrandingBlock(brandName)}

Title: ${diagram.title}

Architecture to illustrate:
${diagram.description}

Landscape infographic. Labels inside shapes and on arrows only. No paragraph text blocks.`;
}

async function loadReferenceImage() {
  const path = join(process.cwd(), BYTEBYTEGO_REFERENCE_PATH);
  const buffer = await readFile(path);
  return toFile(buffer, "bytebytego-reference.png", { type: "image/png" });
}

async function uploadDiagramBuffer(
  buffer: Buffer,
  filename: string
): Promise<PostImage> {
  if (isSupabaseConfigured()) {
    const supabase = createServerClient();
    const path = `diagrams/${filename}`;
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
    return {
      url: data.publicUrl,
      alt: filename,
      aspectRatio: "1.91:1",
      source: "generated",
    };
  }

  return {
    url: `data:image/png;base64,${buffer.toString("base64")}`,
    alt: filename,
    aspectRatio: "1.91:1",
    source: "generated",
  };
}

function extractB64(
  data: Array<{ b64_json?: string | null }> | undefined
): string {
  const b64 = data?.[0]?.b64_json;
  if (!b64) throw new Error("Diagram image generation returned no data");
  return b64;
}

export async function generateDiagramImage(
  diagram: SystemDiagram,
  options: { brandName: string }
): Promise<PostImage> {
  const openai = getOpenAI();
  const brandName = options.brandName.trim();
  const prompt = buildDiagramImagePrompt(diagram, brandName);
  const filename = `diagram-${Date.now()}.png`;

  try {
    const referenceImage = await loadReferenceImage();
    const response = await openai.images.edit({
      model: IMAGE_MODEL,
      image: referenceImage,
      prompt,
      size: "1536x1024",
      quality: "high",
    });
    const buffer = Buffer.from(extractB64(response.data), "base64");
    const uploaded = await uploadDiagramBuffer(buffer, filename);
    return { ...uploaded, alt: diagram.title };
  } catch (editError) {
    console.warn("[diagram-image-gen] images.edit failed, falling back to generate:", editError);
    const response = await openai.images.generate({
      model: IMAGE_MODEL,
      prompt: `ByteByteGo-style educational system architecture infographic. ${prompt}`,
      n: 1,
      size: "1536x1024",
      quality: "high",
    });
    const buffer = Buffer.from(extractB64(response.data), "base64");
    const uploaded = await uploadDiagramBuffer(buffer, filename);
    return { ...uploaded, alt: diagram.title };
  }
}
