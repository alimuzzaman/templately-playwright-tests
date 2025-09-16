/**
 * FSI (Full Site Import) Helper Functions for Playwright Tests
 *
 * This module provides utilities specifically for testing FSI workflows
 * including dependency checking, import progress monitoring, and validation.
 */

const { expect } = require('@playwright/test');

/**
 * FSI Workflow Management
 */
class FSIWorkflow {
  constructor(page) {
    this.page = page;
  }

  /**
   * Start FSI workflow for a template
   * @param {string} templateId - Template ID to import
   */
  async startFSIImport(templateId) {
    // Navigate to template and click FSI button
    await this.page.click(`[data-template-id="${templateId}"] .fsi-import-button`);
    await this.page.waitForSelector('.fsi-modal', { timeout: 10000 });
    console.log(`✅ Started FSI import for template: ${templateId}`);
  }

  /**
   * Handle dependency checking phase
   */
  async handleDependencyCheck() {
    console.log('🔍 Checking dependencies...');

    // Wait for dependency check to complete
    await this.page.waitForSelector('.dependency-check-complete', { timeout: 30000 });

    // Check if there are missing dependencies
    const missingDeps = await this.page.locator('.missing-dependency').count();

    if (missingDeps > 0) {
      console.log(`⚠️  Found ${missingDeps} missing dependencies`);

      // Click install dependencies button
      await this.page.click('.install-dependencies-button');
      await this.page.waitForSelector('.dependencies-installed', { timeout: 60000 });
      console.log('✅ Dependencies installed successfully');
    } else {
      console.log('✅ All dependencies are satisfied');
    }
  }

  /**
   * Monitor import progress
   * @param {number} timeoutMs - Maximum time to wait for import completion
   */
  async monitorImportProgress(timeoutMs = 300000) { // 5 minutes default
    console.log('📊 Monitoring import progress...');

    const startTime = Date.now();
    let lastProgress = 0;

    while (Date.now() - startTime < timeoutMs) {
      // Check for completion
      const isComplete = await this.page.locator('.import-complete').isVisible();
      if (isComplete) {
        console.log('✅ Import completed successfully');
        return true;
      }

      // Check for errors
      const hasError = await this.page.locator('.import-error').isVisible();
      if (hasError) {
        const errorMessage = await this.page.locator('.import-error-message').textContent();
        throw new Error(`Import failed: ${errorMessage}`);
      }

      // Log progress updates
      const progressElement = this.page.locator('.import-progress-percentage');
      if (await progressElement.isVisible()) {
        const currentProgress = parseInt(await progressElement.textContent());
        if (currentProgress > lastProgress) {
          console.log(`📈 Import progress: ${currentProgress}%`);
          lastProgress = currentProgress;
        }
      }

      // Wait before next check
      await this.page.waitForTimeout(2000);
    }

    throw new Error('Import timed out');
  }

  /**
   * Validate import results
   */
  async validateImportResults() {
    console.log('🔍 Validating import results...');

    // Check for success message
    await expect(this.page.locator('.import-success-message')).toBeVisible();

    // Verify imported content exists
    const importedPages = await this.page.locator('.imported-page-item').count();
    const importedTemplates = await this.page.locator('.imported-template-item').count();

    console.log(`✅ Import validation complete: ${importedPages} pages, ${importedTemplates} templates`);

    return {
      pages: importedPages,
      templates: importedTemplates
    };
  }

  /**
   * Handle import customization options
   * @param {Object} options - Customization options
   */
  async handleCustomization(options = {}) {
    const {
      siteName = 'Test Site',
      siteTagline = 'Test Tagline',
      primaryColor = '#007cba',
      uploadLogo = false
    } = options;

    console.log('🎨 Applying customization options...');

    // Set site name
    if (await this.page.locator('#site-name-input').isVisible()) {
      await this.page.fill('#site-name-input', siteName);
    }

    // Set site tagline
    if (await this.page.locator('#site-tagline-input').isVisible()) {
      await this.page.fill('#site-tagline-input', siteTagline);
    }

    // Set primary color
    if (await this.page.locator('#primary-color-picker').isVisible()) {
      await this.page.fill('#primary-color-picker', primaryColor);
    }

    // Handle logo upload if requested
    if (uploadLogo && await this.page.locator('#logo-upload-input').isVisible()) {
      // This would require a test logo file
      console.log('📷 Logo upload requested but skipped in test');
    }

    console.log('✅ Customization options applied');
  }
}

/**
 * FSI Preview Management
 */
class FSIPreview {
  constructor(page) {
    this.page = page;
  }

  /**
   * Wait for preview iframe to load
   */
  async waitForPreviewLoad() {
    await this.page.waitForSelector('.fsi-preview-iframe', { timeout: 30000 });

    // Wait for iframe content to load
    const iframe = this.page.frameLocator('.fsi-preview-iframe');
    await iframe.locator('body').waitFor({ timeout: 30000 });

    console.log('✅ Preview iframe loaded');
  }

  /**
   * Interact with preview iframe
   * @param {Function} callback - Function to execute within iframe context
   */
  async interactWithPreview(callback) {
    const iframe = this.page.frameLocator('.fsi-preview-iframe');
    await callback(iframe);
  }

  /**
   * Take screenshot of preview
   * @param {string} filename - Screenshot filename
   */
  async screenshotPreview(filename) {
    const iframe = this.page.frameLocator('.fsi-preview-iframe');
    await iframe.locator('body').screenshot({ path: `tests/screenshots/${filename}` });
    console.log(`📸 Preview screenshot saved: ${filename}`);
  }

  /**
   * Validate preview content
   */
  async validatePreviewContent() {
    const iframe = this.page.frameLocator('.fsi-preview-iframe');

    // Check for basic page structure
    await expect(iframe.locator('body')).toBeVisible();
    await expect(iframe.locator('header, .header')).toBeVisible();
    await expect(iframe.locator('main, .main-content')).toBeVisible();

    console.log('✅ Preview content validation passed');
  }
}

module.exports = {
  FSIWorkflow,
  FSIPreview
};