/**
 * Templately Helper Functions for Playwright Tests
 *
 * This module provides common utilities for testing Templately functionality
 * including navigation, authentication, and template management.
 */

const { expect } = require('@playwright/test');

/**
 * WordPress and Templately Authentication
 */
class TemplatelyAuth {
  constructor(page) {
    this.page = page;
  }

  /**
   * Login to WordPress admin
   * @param {string} username - WordPress username
   * @param {string} password - WordPress password
   */
  async loginToWordPress(username = 'admin', password = 'password') {
    await this.page.goto('/wp-admin');

    // Check if already logged in
    const isLoggedIn = await this.page.locator('#wpadminbar').isVisible();
    if (isLoggedIn) {
      console.log('✅ Already logged into WordPress');
      return;
    }

    // Fill login form
    await this.page.fill('#user_login', username);
    await this.page.fill('#user_pass', password);
    await this.page.click('#wp-submit');

    // Wait for dashboard
    await this.page.waitForSelector('#wpadminbar', { timeout: 10000 });
    console.log('✅ Successfully logged into WordPress');
  }

  /**
   * Navigate to Templately admin page
   */
  async navigateToTemplately() {
    await this.page.goto('/wp-admin/admin.php?page=templately');
    await this.page.waitForSelector('.templately-admin-page', { timeout: 15000 });
    console.log('✅ Navigated to Templately admin page');
  }

  /**
   * Verify Templately plugin is active
   */
  async verifyTemplatelyActive() {
    await this.page.goto('/wp-admin/plugins.php');
    const templatelyRow = this.page.locator('tr[data-slug="templately"]');
    const isActive = await templatelyRow.locator('.deactivate').isVisible();

    if (!isActive) {
      throw new Error('Templately plugin is not active');
    }

    console.log('✅ Templately plugin is active');
  }
}

/**
 * Templately Navigation and UI Helpers
 */
class TemplatelyNavigation {
  constructor(page) {
    this.page = page;
  }

  /**
   * Navigate to template library
   */
  async goToTemplateLibrary() {
    await this.page.click('[data-tab="my-library"]');
    await this.page.waitForSelector('.templately-template-grid', { timeout: 10000 });
    console.log('✅ Navigated to template library');
  }

  /**
   * Navigate to cloud templates
   */
  async goToCloudTemplates() {
    await this.page.click('[data-tab="cloud-library"]');
    await this.page.waitForSelector('.templately-cloud-templates', { timeout: 10000 });
    console.log('✅ Navigated to cloud templates');
  }

  /**
   * Open template preview modal
   * @param {string} templateId - Template ID or selector
   */
  async openTemplatePreview(templateId) {
    const templateSelector = `[data-template-id="${templateId}"], .template-item:has-text("${templateId}")`;
    await this.page.click(templateSelector);
    await this.page.waitForSelector('.templately-preview-modal', { timeout: 10000 });
    console.log(`✅ Opened template preview for: ${templateId}`);
  }

  /**
   * Close any open modals
   */
  async closeModals() {
    const modalCloseButtons = [
      '.templately-modal .close-button',
      '.templately-preview-modal .close',
      '[data-dismiss="modal"]',
      '.modal-close'
    ];

    for (const selector of modalCloseButtons) {
      const closeButton = this.page.locator(selector);
      if (await closeButton.isVisible()) {
        await closeButton.click();
        await this.page.waitForTimeout(500);
      }
    }
  }
}

/**
 * Template Management Helpers
 */
class TemplateManager {
  constructor(page) {
    this.page = page;
  }

  /**
   * Search for templates
   * @param {string} searchTerm - Search query
   */
  async searchTemplates(searchTerm) {
    await this.page.fill('.templately-search-input', searchTerm);
    await this.page.press('.templately-search-input', 'Enter');
    await this.page.waitForTimeout(2000); // Wait for search results
    console.log(`✅ Searched for templates: ${searchTerm}`);
  }

  /**
   * Filter templates by category
   * @param {string} category - Category name
   */
  async filterByCategory(category) {
    await this.page.click(`[data-category="${category}"]`);
    await this.page.waitForTimeout(2000);
    console.log(`✅ Filtered templates by category: ${category}`);
  }

  /**
   * Get template count
   * @returns {number} Number of visible templates
   */
  async getTemplateCount() {
    const templates = await this.page.locator('.template-item').count();
    console.log(`📊 Found ${templates} templates`);
    return templates;
  }

  /**
   * Select first available template
   * @returns {string} Template ID or name
   */
  async selectFirstTemplate() {
    const firstTemplate = this.page.locator('.template-item').first();
    const templateName = await firstTemplate.getAttribute('data-template-name') || 'Unknown';
    await firstTemplate.click();
    console.log(`✅ Selected template: ${templateName}`);
    return templateName;
  }
}

module.exports = {
  TemplatelyAuth,
  TemplatelyNavigation,
  TemplateManager
};