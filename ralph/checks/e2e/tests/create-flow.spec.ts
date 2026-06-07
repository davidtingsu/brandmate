import { test, expect } from "@playwright/test";
import { installApiStubs, seedOnboardedState } from "../fixtures/stubs";

test.describe("Create flow", () => {
  test.beforeEach(async ({ page }) => {
    await installApiStubs(page);
    await seedOnboardedState(page);
  });

  test("studio opens on create post step with generate form", async ({ page }) => {
    await page.goto("/create");
    await expect(page.getByTestId("create-flow-stepper")).toBeVisible({
      timeout: 30_000,
    });

    await expect(page.getByTestId("profile-form")).not.toBeVisible();
    await expect(page.getByTestId("generate-post-form")).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("create-flow-stepper")).toContainText(
      "Create post"
    );
  });
});
