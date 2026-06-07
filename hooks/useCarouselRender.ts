"use client";

import type {
  BrandProfile,
  CarouselRenderProgressEvent,
  CarouselSlide,
  PostBrandingOptions,
} from "@/lib/types";
import { useCallback, useState } from "react";

export interface CarouselRenderState {
  phase: "idle" | "rendering" | "complete" | "error";
  currentSlide: number;
  totalSlides: number;
  slideStatuses: CarouselSlidePngStatus[];
  error?: string;
}

type CarouselSlidePngStatus = "pending" | "rendering" | "done" | "error";

const initialState: CarouselRenderState = {
  phase: "idle",
  currentSlide: 0,
  totalSlides: 0,
  slideStatuses: [],
};

export function useCarouselRender() {
  const [state, setState] = useState<CarouselRenderState>(initialState);

  const reset = useCallback(() => setState(initialState), []);

  const streamRender = useCallback(
    async (input: {
      slides: CarouselSlide[];
      portraitImageUrl?: string;
      topic?: string;
      brandProfile?: BrandProfile;
      branding?: PostBrandingOptions;
    }): Promise<CarouselSlide[]> => {
      const total = input.slides.length;
      setState({
        phase: "rendering",
        currentSlide: 0,
        totalSlides: total,
        slideStatuses: input.slides.map(() => "pending"),
      });

      const res = await fetch("/api/agents/carousel/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({}));
        const message =
          (err as { error?: string }).error ?? "Carousel render failed";
        setState((s) => ({ ...s, phase: "error", error: message }));
        throw new Error(message);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finalSlides = input.slides;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith("data:")) continue;
          const json = line.slice(5).trim();
          try {
            const event = JSON.parse(json) as CarouselRenderProgressEvent;
            if (event.type === "progress" && event.slideIndex !== undefined) {
              setState((s) => ({
                ...s,
                currentSlide: event.slideIndex! + 1,
                slideStatuses: s.slideStatuses.map((st, i) =>
                  i === event.slideIndex ? "rendering" : st
                ),
              }));
            }
            if (event.type === "slide_done" && event.slideIndex !== undefined) {
              setState((s) => ({
                ...s,
                slideStatuses: s.slideStatuses.map((st, i) =>
                  i === event.slideIndex ? "done" : st
                ),
              }));
              if (event.slides) {
                finalSlides = event.slides;
              }
            }
            if (event.type === "complete" && event.slides) {
              finalSlides = event.slides;
              setState((s) => ({
                ...s,
                phase: "complete",
                slideStatuses: event.slides!.map((sl) => sl.pngStatus ?? "done"),
              }));
            }
            if (event.type === "error") {
              setState((s) => ({
                ...s,
                phase: "error",
                error: event.error,
              }));
            }
          } catch {
            // ignore malformed SSE chunks
          }
        }
      }

      return finalSlides;
    },
    []
  );

  return { carouselRenderState: state, streamRender, resetCarouselRender: reset };
}
