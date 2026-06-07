import { renderSlidePng } from "@/lib/carousel/render-slide";
import type {
  CarouselRenderInput,
  CarouselRenderProgressEvent,
  CarouselSlide,
} from "@/lib/types";

export type RenderProgressCallback = (
  event: CarouselRenderProgressEvent
) => void;

export async function renderCarouselSlides(
  input: CarouselRenderInput,
  onProgress?: RenderProgressCallback
): Promise<CarouselSlide[]> {
  const slides = input.slides.map((s) => ({
    ...s,
    pngStatus: "pending" as const,
  }));
  const total = slides.length;

  onProgress?.({ type: "progress", slideIndex: 0, total });

  const results: CarouselSlide[] = slides.map((s) => ({ ...s }));

  await Promise.all(
    slides.map(async (slide, i) => {
      onProgress?.({
        type: "progress",
        slideIndex: i,
        total,
      });

      try {
        const imageUrl = await renderSlidePng({
          slide,
          portraitImageUrl: input.portraitImageUrl,
          topic: input.topic,
          brandProfile: input.brandProfile,
          branding: input.branding,
          totalSlides: total,
        });

        const done: CarouselSlide = {
          ...slide,
          imageUrl,
          pngStatus: "done",
        };
        results[i] = done;

        onProgress?.({
          type: "slide_done",
          slideIndex: i,
          total,
          imageUrl,
          slides: [...results],
        });
      } catch (err) {
        const failed: CarouselSlide = {
          ...slide,
          pngStatus: "error",
        };
        results[i] = failed;
        onProgress?.({
          type: "error",
          slideIndex: i,
          total,
          error: err instanceof Error ? err.message : "Render failed",
        });
      }
    })
  );

  onProgress?.({
    type: "complete",
    total,
    slides: results,
  });

  return results;
}
