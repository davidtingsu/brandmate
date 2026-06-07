import type { Page } from "@playwright/test";
import carouselAttempt from "./carousel-attempt.json";

export const E2E_SAMPLE_PROFILE = {
  name: "E2E Tester",
  niche: "Product engineering",
  audience: "Founders",
  voice: "Direct and practical",
};

export async function seedOnboardedState(page: Page) {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3005";
  const { hostname } = new URL(baseURL);

  await page.context().addCookies([
    {
      name: "brandmate_onboarded",
      value: "1",
      domain: hostname,
      path: "/",
    },
  ]);

  await page.addInitScript((profile) => {
    localStorage.setItem("brandmate.profile", JSON.stringify(profile));
  }, E2E_SAMPLE_PROFILE);
}

const TINY_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

function buildRenderedSlides() {
  const slides =
    carouselAttempt.attempt.variants[0]?.slides?.map((slide) => ({
      ...slide,
      imageUrl: TINY_PNG,
      pngStatus: "done" as const,
    })) ?? [];

  return slides;
}

function buildCarouselRenderSse(): string {
  const slides = buildRenderedSlides();
  const total = slides.length;
  const lines: string[] = [];

  for (let i = 0; i < total; i++) {
    const partial = slides.map((s, idx) =>
      idx <= i ? s : { ...s, imageUrl: undefined, pngStatus: "pending" as const }
    );
    lines.push(
      `data: ${JSON.stringify({ type: "progress", slideIndex: i, total })}\n\n`
    );
    lines.push(
      `data: ${JSON.stringify({
        type: "slide_done",
        slideIndex: i,
        total,
        imageUrl: TINY_PNG,
        slides: partial,
      })}\n\n`
    );
  }

  lines.push(
    `data: ${JSON.stringify({ type: "complete", total, slides })}\n\n`
  );
  return lines.join("");
}

export async function installApiStubs(page: Page) {
  await page.route("**/api/sessions**", async (route) => {
    const method = route.request().method();
    if (method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ threads: [], enabled: false }),
      });
      return;
    }
    if (method === "POST") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          thread: {
            id: "e2e-session",
            user_id: "e2e-user",
            title: null,
            copilot_thread_id: "e2e-copilot",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        }),
      });
      return;
    }
    await route.continue();
  });

  await page.route("**/api/agents/orchestrate", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(carouselAttempt),
    });
  });

  await page.route("**/api/agents/carousel/render", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
      body: buildCarouselRenderSse(),
    });
  });

  await page.route("**/api/copilotkit/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });
}
