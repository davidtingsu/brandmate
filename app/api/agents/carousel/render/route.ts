import { renderCarouselSlides } from "@/lib/pipeline/carousel-render";
import type { CarouselRenderInput } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 120;

function sseLine(data: object): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function POST(request: Request) {
  let body: CarouselRenderInput;
  try {
    body = (await request.json()) as CarouselRenderInput;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!body.slides?.length) {
    return new Response(JSON.stringify({ error: "slides required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (event: object) => {
        controller.enqueue(encoder.encode(sseLine(event)));
      };

      try {
        await renderCarouselSlides(body, send);
      } catch (err) {
        send({
          type: "error",
          error: err instanceof Error ? err.message : "Render failed",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
