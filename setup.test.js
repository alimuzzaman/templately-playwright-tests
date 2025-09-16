/**
 * Templately Test Setup
 *
 * This file handles the initial setup required for running Templately tests.
 * It ensures WordPress is properly configured, plugins are activated,
 * and test environment is ready.
 */

const { test, expect } = require('@playwright/test');
const { TemplatelyAuth } = require('./utils/templately-helpers');

test.describe.configure({ mode: 'serial' });

test.describe('Templately Test Environment Setup', () => {
  test('should verify WordPress is accessible', async ({ page }) => {
    console.log('🌐 Verifying WordPress accessibility...');

    await page.goto('/wp-admin');

    // Check if WordPress is running
    const isWordPress = await page.locator('body').isVisible();
    expect(isWordPress).toBeTruthy();

    // Check for WordPress admin elements
    const hasWPElements = await page.locator('#wpadminbar, #loginform, .wp-admin').count() > 0;
    expect(hasWPElements).toBeTruthy();

    console.log('✅ WordPress is accessible');
  });

  test('should login to WordPress admin', async ({ page }) => {
    console.log('🔐 Testing WordPress login...');

    const auth = new TemplatelyAuth(page);
    await auth.loginToWordPress();

    // Verify successful login
    await expect(page.locator('#wpadminbar')).toBeVisible();
    await expect(page.locator('.wp-admin')).toBeVisible();

    console.log('✅ WordPress login successful');
  });

  test('should verify Templately plugin is installed', async ({ page }) => {
    console.log('🔌 Checking Templately plugin installation...');

    const auth = new TemplatelyAuth(page);
    await auth.loginToWordPress();

    await page.goto('/wp-admin/plugins.php');

    // Check if Templately plugin exists
    const templatelyPlugin = page.locator('tr[data-slug="templately"]');
    await expect(templatelyPlugin).toBeVisible();

    console.log('✅ Templately plugin is installed');
  });

  test('should activate Templately plugin if needed', async ({ page }) => {
    console.log('⚡ Ensuring Templately plugin is active...');

    const auth = new TemplatelyAuth(page);
    await auth.loginToWordPress();

    await page.goto('/wp-admin/plugins.php');

    const templatelyRow = page.locator('tr[data-slug="templately"]');
    const isActive = await templatelyRow.locator('.deactivate').isVisible();

    if (!isActive) {
      console.log('🔌 Activating Templately plugin...');
      await templatelyRow.locator('.activate a').click();
      await page.waitForSelector('.notice-success', { timeout: 10000 });
      console.log('✅ Templately plugin activated');
    } else {
      console.log('✅ Templately plugin is already active');
    }
  });

  test('should verify Templately admin page is accessible', async ({ page }) => {
    console.log('📄 Testing Templately admin page access...');

    const auth = new TemplatelyAuth(page);
    await auth.loginToWordPress();
    await auth.navigateToTemplately();

    // Verify Templately admin page loads
    await expect(page.locator('.templately-admin-page')).toBeVisible({ timeout: 15000 });

    console.log('✅ Templately admin page is accessible');
  });

  test('should verify required dependencies', async ({ page }) => {
    console.log('🔍 Checking required dependencies...');

    const auth = new TemplatelyAuth(page);
    await auth.loginToWordPress();

    // Check for Elementor (if required)
    await page.goto('/wp-admin/plugins.php');
    const hasElementor = await page.locator('tr[data-slug="elementor"]').count() > 0;

    if (hasElementor) {
      console.log('✅ Elementor plugin detected');
    } else {
      console.log('ℹ️  Elementor plugin not installed (may be required for some tests)');
    }

    // Check WordPress version
    await page.goto('/wp-admin/');
    const versionElement = await page.locator('#footer-upgrade').textContent();
    const wpVersion = versionElement?.match(/Version ([\d.]+)/)?.[1];

    if (wpVersion) {
      console.log(`✅ WordPress version: ${wpVersion}`);
    }
  });

  test('should create test directories', async ({ page }) => {
    console.log('📁 Setting up test directories...');

    const fs = require('fs');
    const dirs = [
      'tests/screenshots',
      'tests/videos',
      'tests/traces',
      'tests/reports',
      'tests/reports/html'
    ];

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
      }
    });

    console.log('✅ Test directories ready');
  });

  test('should save environment information', async ({ page }) => {
    console.log('💾 Saving environment information...');

    const auth = new TemplatelyAuth(page);
    await auth.loginToWordPress();

    // Gather environment info
    const envInfo = {
      timestamp: new Date().toISOString(),
      baseURL: page.url().replace(/\/wp-admin.*/, ''),
      userAgent: await page.evaluate(() => navigator.userAgent),
      viewport: await page.viewportSize(),
      setupComplete: true
    };

    // Get WordPress version
    await page.goto('/wp-admin/');
    const versionElement = await page.locator('#footer-upgrade').textContent();
    envInfo.wordpressVersion = versionElement?.match(/Version ([\d.]+)/)?.[1] || 'unknown';

    // Get Templately version
    await page.goto('/wp-admin/plugins.php');
    const templatelyVersion = await page.locator('tr[data-slug="templately"] .plugin-version-author-uri').textContent();
    envInfo.templatelyVersion = templatelyVersion?.match(/Version ([\d.]+)/)?.[1] || 'unknown';

    // Save to file
    const fs = require('fs');
    fs.writeFileSync('tests/data/environment-info.json', JSON.stringify(envInfo, null, 2));

    console.log('✅ Environment information saved');
    console.log(`📊 WordPress: ${envInfo.wordpressVersion}, Templately: ${envInfo.templatelyVersion}`);
  });
});