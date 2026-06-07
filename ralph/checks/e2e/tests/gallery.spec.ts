import { test, expect } from "@playwright/test";
import { installApiStubs, seedOnboardedState } from "../fixtures/stubs";

test.describe("Gallery", () => {
  test.beforeEach(async ({ page }) => {
    await installApiStubs(page);
    await seedOnboardedState(page);
  });

  test("home loads and create navigates to /create", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /your posts/i })).toBeVisible();
    await page.getByTestId("create-new-post").first().click();
    await expect(page).toHaveURL(/\/create/);
  });
});
