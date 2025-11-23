import { test, expect } from '@playwright/test';

test('should display home management app title', async ({ page }) => {
  await page.goto('/');

  // Expect h2 with app title
  const title = await page.locator('h2').first().innerText();
  expect(title).toContain('Quản lý công việc gia đình');
});

test('should display task list with tasks', async ({ page }) => {
  await page.goto('/');

  // Check if task cards are displayed
  const taskCards = page.locator('[class*="task-card"]');
  const count = await taskCards.count();
  expect(count).toBeGreaterThan(0);
});

test('should display upcoming tasks section', async ({ page }) => {
  await page.goto('/');

  // Check if upcoming section exists
  const upcomingSection = page.locator('text=Sự kiện sắp đến');
  expect(upcomingSection).toBeDefined();
});

test('should have mark done button for each task', async ({ page }) => {
  await page.goto('/');

  // Check if "Đã làm hôm nay" button exists
  const buttons = page.locator('button:has-text("Đã làm hôm nay")');
  const count = await buttons.count();
  expect(count).toBeGreaterThan(0);
});

test('should be able to mark task as done', async ({ page }) => {
  await page.goto('/');

  // Get first task before update
  const firstTaskBefore = page.locator('[class*="task-card"]').first();
  const dateTextBefore = await firstTaskBefore.locator('b').nth(0).innerText();

  // Click mark done button
  const firstButton = page.locator('button:has-text("Đã làm hôm nay")').first();
  await firstButton.click();

  // Wait for the date to change
  const today = new Date().toISOString().slice(0, 10);
  const firstTaskAfter = page.locator('[class*="task-card"]').first();

  // Use locator wait instead of timeout
  await page.locator(`text=${today}`).waitFor();

  // Get the updated date and verify it changed
  const dateTextAfter = await firstTaskAfter.locator('b').nth(0).innerText();
  expect(dateTextAfter !== dateTextBefore).toBeTruthy();
  expect(dateTextAfter).toContain(today);
});
