import { test, expect } from "@playwright/test";
import { installApiStubs } from "../fixtures/stubs";

test.describe("Carousel flow", () => {
  test.beforeEach(async ({ page }) => {
    await installApiStubs(page);
  });

  test("carousel generate shows progress and post card with download", async ({
    page,
  }) => {
    await page.goto("/create");
    await expect(page.getByTestId("create-flow-stepper")).toBeVisible({
      timeout: 30_000,
    });

    const profileForm = page.getByTestId("profile-form");
    await profileForm.getByPlaceholder("Your name").fill("E2E Tester");
    await profileForm.getByPlaceholder(/AI engineering/i).fill("Engineering");
    await profileForm.getByRole("button", { name: /create profile/i }).click();

    const genForm = page.getByTestId("generate-post-form");
    await expect(genForm).toBeVisible({ timeout: 15_000 });

    await genForm.getByPlaceholder(/transition from engineer/i).fill(
      "AI tools for engineers"
    );
    await genForm.getByRole("button", { name: "Carousel" }).click();
    await genForm.getByRole("button", { name: /use example/i }).click();
    await genForm.getByRole("button", { name: /^generate$/i }).click();

    const progress = page.getByTestId("carousel-render-progress");
    await expect(progress).toBeVisible({ timeout: 15_000 });
    await expect(progress).toContainText(/all slides rendered/i, {
      timeout: 30_000,
    });

    await expect(page.getByTestId("create-flow-stepper")).toBeVisible();
    await expect(page.getByRole("heading", { name: /linkedin post/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /download slides/i })).toBeVisible({
      timeout: 15_000,
    });
  });
});
