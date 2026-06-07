import { renderSlidePng } from "@/lib/carousel/render-slide";
import type {
  CarouselRenderInput,
  CarouselRenderProgressEvent,
  CarouselSlide,
} from "@/lib/types";

export type RenderProgressCallback = (
  event: CarouselRenderProgressEvent
) => void;

const RENDER_CONCURRENCY = 3;

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function worker() {
    while (true) {
      const i = nextIndex++;
      if (i >= items.length) break;
      results[i] = await fn(items[i], i);
    }
  }

  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    () => worker()
  );
  await Promise.all(workers);
  return results;
}

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

  await mapWithConcurrency(slides, RENDER_CONCURRENCY, async (slide, i) => {
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
        userFeedback: input.userFeedback,
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
  });

  onProgress?.({
    type: "complete",
    total,
    slides: results,
  });

  return results;
}
