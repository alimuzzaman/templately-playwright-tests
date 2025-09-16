/**
 * Global Setup for Templately Playwright Tests
 *
 * This file handles the global setup required for testing Templately FSI workflows.
 * It ensures WordPress is properly configured and Templately plugin is activated.
 */

const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

async function globalSetup(config) {
  console.log('🚀 Starting Templately Test Environment Setup...');

  // Create necessary directories
  const dirs = [
    'tests/reports',
    'tests/reports/html',
    'tests/screenshots',
    'tests/videos',
    'tests/traces'
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  });

  // Launch browser for setup
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    const baseURL = process.env.WP_BASE_URL || 'http://localhost:8080';
    console.log(`🌐 Connecting to WordPress at: ${baseURL}`);

    // Navigate to WordPress admin
    await page.goto(`${baseURL}/wp-admin`);

    // Check if WordPress is accessible
    const isWordPressReady = await page.locator('body').isVisible();
    if (!isWordPressReady) {
      throw new Error('WordPress is not accessible. Please ensure WordPress is running.');
    }

    console.log('✅ WordPress is accessible');

    // Login if needed
    const isLoginPage = await page.locator('#loginform').isVisible();
    if (isLoginPage) {
      console.log('🔐 Logging into WordPress...');

      const username = process.env.WP_USERNAME || 'admin';
      const password = process.env.WP_PASSWORD || 'password';

      await page.fill('#user_login', username);
      await page.fill('#user_pass', password);
      await page.click('#wp-submit');

      // Wait for dashboard
      await page.waitForSelector('#wpadminbar', { timeout: 10000 });
      console.log('✅ Successfully logged into WordPress');
    }

    // Check if Templately plugin is active
    await page.goto(`${baseURL}/wp-admin/plugins.php`);

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

    // Verify Templately admin page is accessible
    await page.goto(`${baseURL}/wp-admin/admin.php?page=templately`);
    const templatelyPage = await page.locator('.templately-admin-page').isVisible();

    if (templatelyPage) {
      console.log('✅ Templately admin page is accessible');
    } else {
      console.warn('⚠️  Templately admin page may not be fully loaded');
    }

    // Set up test data storage
    const testData = {
      baseURL,
      setupTime: new Date().toISOString(),
      wordpressVersion: await getWordPressVersion(page),
      templatelyVersion: await getTemplatelyVersion(page)
    };

    fs.writeFileSync('tests/data/setup-data.json', JSON.stringify(testData, null, 2));
    console.log('💾 Test setup data saved');

    console.log('🎉 Global setup completed successfully!');

  } catch (error) {
    console.error('❌ Global setup failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

/**
 * Get WordPress version from admin dashboard
 */
async function getWordPressVersion(page) {
  try {
    await page.goto(page.url().replace(/\/wp-admin.*/, '/wp-admin/'));
    const versionElement = await page.locator('#footer-upgrade').textContent();
    return versionElement?.match(/Version ([\d.]+)/)?.[1] || 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Get Templately plugin version
 */
async function getTemplatelyVersion(page) {
  try {
    await page.goto(page.url().replace(/\/wp-admin.*/, '/wp-admin/plugins.php'));
    const versionElement = await page.locator('tr[data-slug="templately"] .plugin-version-author-uri').textContent();
    return versionElement?.match(/Version ([\d.]+)/)?.[1] || 'unknown';
  } catch {
    return 'unknown';
  }
}

module.exports = globalSetup;