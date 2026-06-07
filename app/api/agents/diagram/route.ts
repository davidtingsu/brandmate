import { generateSystemDiagram } from "@/lib/agents/diagram-agent";
import { generateDiagramImage } from "@/lib/pipeline/diagram-image-gen";
import { formatError } from "@/lib/weave/errors";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { concept, context } = body as {
      concept?: string;
      context?: string;
    };

    if (!concept?.trim()) {
      return NextResponse.json(
        { error: "concept is required" },
        { status: 400 }
      );
    }

    const result = await generateSystemDiagram({
      concept: concept.trim(),
      context: context?.trim(),
    });
    const image = await generateDiagramImage(result.diagram);

    return NextResponse.json({ ...result, imageUrl: image.url });
  } catch (error) {
    console.error("[diagram agent]", error);
    return NextResponse.json({ error: formatError(error) }, { status: 500 });
  }
}
