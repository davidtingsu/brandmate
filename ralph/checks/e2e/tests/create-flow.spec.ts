import { test, expect } from "@playwright/test";
import { installApiStubs } from "../fixtures/stubs";

test.describe("Create flow", () => {
  test.beforeEach(async ({ page }) => {
    await installApiStubs(page);
  });

  test("stepper visible and profile advances to post step", async ({ page }) => {
    await page.goto("/create");
    await expect(page.getByTestId("create-flow-stepper")).toBeVisible({
      timeout: 30_000,
    });

    const profileForm = page.getByTestId("profile-form");
    await expect(profileForm).toBeVisible();

    await profileForm.getByPlaceholder("Your name").fill("E2E Tester");
    await profileForm.getByPlaceholder(/AI engineering/i).fill("Product engineering");
    await profileForm.getByRole("button", { name: /create profile/i }).click();

    await expect(page.getByTestId("generate-post-form")).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("create-flow-stepper")).toContainText(
      "Create post"
    );
  });
});
