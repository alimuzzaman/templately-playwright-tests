/**
 * Templately FSI (Full Site Import) Workflow Tests
 *
 * This test suite validates the traditional Full Site Import functionality
 * including template selection, dependency management, import process, and validation.
 *
 * Test Coverage:
 * - Template selection and preview
 * - Dependency checking and installation
 * - Import progress monitoring
 * - Customization options
 * - Import validation and cleanup
 */

const { test, expect } = require('@playwright/test');
const { TemplatelyAuth, TemplatelyNavigation, TemplateManager } = require('./utils/templately-helpers');
const { FSIWorkflow, FSIPreview } = require('./utils/fsi-helpers');

// Test data for different scenarios
const testScenarios = [
  {
    name: 'Business Website Template',
    templateId: 'business-template-001',
    category: 'business',
    expectedPages: 5,
    expectedTemplates: 8
  },
  {
    name: 'Portfolio Template',
    templateId: 'portfolio-template-001',
    category: 'portfolio',
    expectedPages: 4,
    expectedTemplates: 6
  },
  {
    name: 'E-commerce Template',
    templateId: 'ecommerce-template-001',
    category: 'ecommerce',
    expectedPages: 7,
    expectedTemplates: 12
  }
];

test.describe('Templately FSI Workflow Tests', () => {
  let auth, navigation, templateManager, fsiWorkflow, fsiPreview;

  test.beforeEach(async ({ page }) => {
    // Initialize helper classes
    auth = new TemplatelyAuth(page);
    navigation = new TemplatelyNavigation(page);
    templateManager = new TemplateManager(page);
    fsiWorkflow = new FSIWorkflow(page);
    fsiPreview = new FSIPreview(page);

    // Setup: Login and navigate to Templately
    await auth.loginToWordPress();
    await auth.verifyTemplatelyActive();
    await auth.navigateToTemplately();
  });

  test.afterEach(async ({ page }) => {
    // Cleanup: Close any open modals and take screenshot on failure
    await navigation.closeModals();

    if (test.info().status === 'failed') {
      await page.screenshot({
        path: `tests/screenshots/fsi-failure-${Date.now()}.png`,
        fullPage: true
      });
    }
  });

  test('should complete basic FSI workflow successfully', async ({ page }) => {
    test.setTimeout(600000); // 10 minutes for full workflow

    // Navigate to cloud templates
    await navigation.goToCloudTemplates();

    // Search and select a template
    await templateManager.searchTemplates('business');
    const templateName = await templateManager.selectFirstTemplate();

    // Start FSI import
    await fsiWorkflow.startFSIImport(templateName);

    // Handle dependency checking
    await fsiWorkflow.handleDependencyCheck();

    // Apply basic customization
    await fsiWorkflow.handleCustomization({
      siteName: 'Test Business Site',
      siteTagline: 'Automated Test Site',
      primaryColor: '#007cba'
    });

    // Monitor import progress
    await fsiWorkflow.monitorImportProgress();

    // Validate import results
    const results = await fsiWorkflow.validateImportResults();

    expect(results.pages).toBeGreaterThan(0);
    expect(results.templates).toBeGreaterThan(0);

    console.log(`✅ FSI workflow completed: ${results.pages} pages, ${results.templates} templates imported`);
  });

  test('should handle dependency installation correctly', async ({ page }) => {
    test.setTimeout(300000); // 5 minutes

    await navigation.goToCloudTemplates();

    // Select a template that requires dependencies
    await templateManager.filterByCategory('ecommerce');
    const templateName = await templateManager.selectFirstTemplate();

    await fsiWorkflow.startFSIImport(templateName);

    // This test specifically focuses on dependency handling
    await fsiWorkflow.handleDependencyCheck();

    // Verify dependencies are properly installed
    const dependencyStatus = await page.locator('.dependency-status').textContent();
    expect(dependencyStatus).toContain('satisfied');
  });

  test('should validate preview functionality', async ({ page }) => {
    test.setTimeout(180000); // 3 minutes

    await navigation.goToCloudTemplates();
    const templateName = await templateManager.selectFirstTemplate();

    // Open template preview
    await navigation.openTemplatePreview(templateName);

    // Wait for preview to load
    await fsiPreview.waitForPreviewLoad();

    // Validate preview content
    await fsiPreview.validatePreviewContent();

    // Take screenshot of preview
    await fsiPreview.screenshotPreview(`preview-${templateName}-${Date.now()}.png`);

    // Test preview interactions
    await fsiPreview.interactWithPreview(async (iframe) => {
      await expect(iframe.locator('header')).toBeVisible();
      await expect(iframe.locator('main')).toBeVisible();
      await expect(iframe.locator('footer')).toBeVisible();
    });
  });

  // Data-driven tests for different template types
  testScenarios.forEach(scenario => {
    test(`should import ${scenario.name} successfully`, async ({ page }) => {
      test.setTimeout(600000); // 10 minutes

      await navigation.goToCloudTemplates();
      await templateManager.filterByCategory(scenario.category);

      // Try to find the specific template or use first available
      const templates = await templateManager.getTemplateCount();
      if (templates === 0) {
        test.skip(`No templates found in ${scenario.category} category`);
      }

      const templateName = await templateManager.selectFirstTemplate();
      await fsiWorkflow.startFSIImport(templateName);
      await fsiWorkflow.handleDependencyCheck();

      await fsiWorkflow.handleCustomization({
        siteName: `Test ${scenario.name}`,
        siteTagline: `Automated test for ${scenario.name}`
      });

      await fsiWorkflow.monitorImportProgress();
      const results = await fsiWorkflow.validateImportResults();

      // Validate expected results
      expect(results.pages).toBeGreaterThanOrEqual(scenario.expectedPages - 2); // Allow some variance
      expect(results.templates).toBeGreaterThanOrEqual(scenario.expectedTemplates - 3);

      console.log(`✅ ${scenario.name} import completed successfully`);
    });
  });

  test('should handle import errors gracefully', async ({ page }) => {
    test.setTimeout(300000); // 5 minutes

    // This test simulates error conditions
    await navigation.goToCloudTemplates();

    // Try to import with invalid conditions or network issues
    // Note: This would require specific test setup to trigger errors

    const templateName = await templateManager.selectFirstTemplate();

    try {
      await fsiWorkflow.startFSIImport(templateName);

      // Simulate network interruption or other error conditions
      // This would be implemented based on specific error scenarios

    } catch (error) {
      // Verify error handling
      const errorMessage = await page.locator('.import-error-message').textContent();
      expect(errorMessage).toBeTruthy();
      console.log(`✅ Error handled gracefully: ${errorMessage}`);
    }
  });

  test('should support import cancellation', async ({ page }) => {
    test.setTimeout(180000); // 3 minutes

    await navigation.goToCloudTemplates();
    const templateName = await templateManager.selectFirstTemplate();

    await fsiWorkflow.startFSIImport(templateName);
    await fsiWorkflow.handleDependencyCheck();

    // Start import and then cancel
    await page.click('.start-import-button');
    await page.waitForTimeout(5000); // Wait for import to start

    await page.click('.cancel-import-button');

    // Verify cancellation
    const cancelMessage = await page.locator('.import-cancelled-message').textContent();
    expect(cancelMessage).toContain('cancelled');

    console.log('✅ Import cancellation handled correctly');
  });
});