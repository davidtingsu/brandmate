import { uploadPostImage } from "@/lib/pipeline/image-gen";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { formatError } from "@/lib/weave/errors";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Supabase not configured for image upload" },
        { status: 503 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const name =
      file instanceof File ? file.name : `upload-${Date.now()}.png`;
    const contentType = file.type || "image/png";

    const image = await uploadPostImage(buffer, contentType, name);
    return NextResponse.json({ image });
  } catch (error) {
    console.error("[image]", error);
    return NextResponse.json({ error: formatError(error) }, { status: 500 });
  }
}
