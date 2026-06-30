import { test, expect } from "@playwright/test";

// Happy path: a brand-new visitor signs up, finds an anime, tracks it, and
// sees it in their library. Exercises auth, the AniList search, the watchlist
// server actions, and the library page end to end.
test("a new user can register, find an anime, and track it", async ({
  page,
}) => {
  const username = `e2e_${Date.now()}`;
  const password = "password123";

  // Register — the action signs the user in and redirects to the library.
  await page.goto("/register");
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/library/);

  // Search AniList and open the first result, remembering which title it is.
  await page.goto("/search?q=Frieren");
  const firstResult = page.locator('a[href^="/anime/"]').first();
  await expect(firstResult).toBeVisible();
  const href = await firstResult.getAttribute("href");
  expect(href).toMatch(/^\/anime\/\d+$/);
  await firstResult.click();
  await expect(page).toHaveURL(/\/anime\/\d+/);

  // Track it.
  await page.getByRole("button", { name: "Add to Watchlist" }).click();
  await expect(page.getByText("In your library")).toBeVisible();

  // It now shows up in the library (matched by its detail-page link).
  await page.goto("/library");
  await expect(page.locator(`a[href="${href}"]`).first()).toBeVisible();
});
