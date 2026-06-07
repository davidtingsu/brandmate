import { test, expect } from "@playwright/test";
import { installApiStubs } from "../fixtures/stubs";

test.describe("Onboarding", () => {
  test.beforeEach(async ({ page }) => {
    await installApiStubs(page);
  });

  test("redirects to onboard and completes profile before gallery", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/onboard/);
    await expect(page.getByTestId("onboard-page")).toBeVisible();

    const profileForm = page.getByTestId("profile-form");
    await profileForm.getByPlaceholder("Your name").fill("E2E Tester");
    await profileForm.getByPlaceholder(/AI engineering/i).fill("Engineering");
    await profileForm.getByRole("button", { name: /create profile/i }).click();

    await expect(page).toHaveURL("/");
    await expect(page.getByRole("heading", { name: /your posts/i })).toBeVisible({
      timeout: 15_000,
    });
  });
});
