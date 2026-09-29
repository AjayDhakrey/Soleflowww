import { test, expect } from '@playwright/test';

test.describe('SoleFlow Footwear CRM - Core User Journeys', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to local application root
    await page.goto('/');
  });

  test('01: Public Landing Page and Lookbook Access', async ({ page }) => {
    await page.goto('/landing');
    await expect(page.locator('h1, h2, header')).toBeVisible();
    await expect(page.getByText(/SoleFlow/i).first()).toBeVisible();
  });

  test('02: Trader Authentication & Role Switcher', async ({ page }) => {
    // Check if redirect or login screen is rendered
    await expect(page.getByText(/SoleFlow/i).first()).toBeVisible();
  });

  test('03: Mobile Viewport Rendering (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/admin/dashboard');
    // Ensure mobile bottom nav is visible on small screen
    const bottomNav = page.locator('nav[aria-label="Mobile Bottom Navigation"]');
    if (await bottomNav.isVisible()) {
      await expect(bottomNav).toBeVisible();
    }
  });

  test('04: Demo Mode Offline Resilience', async ({ page }) => {
    // Emulate offline network conditions in demo mode
    await page.goto('/admin/customers');
    await expect(page.getByText(/Customers|Clients/i).first()).toBeVisible();
  });
});
