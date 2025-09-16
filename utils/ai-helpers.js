/**
 * AI FSI Helper Functions for Playwright Tests
 *
 * This module provides utilities for testing AI-powered Full Site Import workflows
 * including conversation handling, step validation, and response parsing.
 */

const { expect } = require('@playwright/test');

/**
 * AI Conversation Management
 */
class AIConversation {
  constructor(page) {
    this.page = page;
    this.conversationSteps = [];
  }

  /**
   * Start AI FSI workflow
   */
  async startAIWorkflow() {
    await this.page.click('.build-with-ai-button, [data-action="start-ai-workflow"]');
    await this.page.waitForSelector('.ai-conversation-container', { timeout: 15000 });
    console.log('✅ AI FSI workflow started');
  }

  /**
   * Wait for AI message and validate
   * @param {string} expectedMessage - Expected AI message content (partial match)
   * @param {number} timeout - Timeout in milliseconds
   */
  async waitForAIMessage(expectedMessage, timeout = 30000) {
    const messageSelector = '.ai-message:last-child .message-content';
    await this.page.waitForSelector(messageSelector, { timeout });

    const actualMessage = await this.page.locator(messageSelector).textContent();

    if (expectedMessage && !actualMessage.includes(expectedMessage)) {
      throw new Error(`Expected AI message to contain "${expectedMessage}", but got: "${actualMessage}"`);
    }

    console.log(`✅ AI message received: ${actualMessage.substring(0, 100)}...`);
    return actualMessage;
  }

  /**
   * Send user response to AI
   * @param {string} response - User response text
   * @param {boolean} useButton - Whether to click a button instead of typing
   * @param {string} buttonText - Button text to click if useButton is true
   */
  async sendUserResponse(response, useButton = false, buttonText = null) {
    if (useButton && buttonText) {
      await this.page.click(`button:has-text("${buttonText}")`);
    } else {
      // Type in the input field
      const inputSelector = '.ai-input-field, .user-input, [placeholder*="answer"], [placeholder*="Type"]';
      await this.page.fill(inputSelector, response);

      // Click submit button
      const submitSelector = '.submit-button, .send-button, button[type="submit"]';
      await this.page.click(submitSelector);
    }

    // Wait for response to be processed
    await this.page.waitForTimeout(1000);

    this.conversationSteps.push({
      type: 'user',
      content: response,
      timestamp: new Date().toISOString()
    });

    console.log(`✅ User response sent: ${response}`);
  }

  /**
   * Complete business information collection workflow
   * @param {Object} businessData - Business information
   */
  async completeBusinessInfoWorkflow(businessData = {}) {
    const {
      businessName = 'TechSolutions Pro',
      industry = 'Technology',
      description = 'We are a leading technology consulting company specializing in digital transformation, cloud solutions, and innovative software development. Our expert team helps businesses modernize their operations and achieve sustainable growth through cutting-edge technology solutions.',
      email = 'contact@techsolutionspro.com',
      phone = '+1-555-123-4567',
      address = '456 Tech Plaza, Suite 789, Innovation District, San Francisco, CA 94105, United States',
      hours = 'Monday to Friday: 9:00 AM to 6:00 PM (PST), Saturday: 10:00 AM to 2:00 PM (PST), Sunday: Closed',
      replaceImages = false
    } = businessData;

    console.log('🤖 Starting AI business information collection workflow...');

    // Step 1: Business Name
    await this.waitForAIMessage('business name');
    await this.sendUserResponse(businessName);

    // Step 2: Industry Type
    await this.waitForAIMessage('type of business');
    await this.sendUserResponse(industry);

    // Step 3: Business Description
    await this.waitForAIMessage('describe your business');
    await this.sendUserResponse(description);

    // Step 4: Email Address
    await this.waitForAIMessage('email address');
    await this.sendUserResponse(email);

    // Step 5: Phone Number (Optional)
    await this.waitForAIMessage('contact number');
    await this.sendUserResponse(phone);

    // Step 6: Business Address
    await this.waitForAIMessage('business address');
    await this.sendUserResponse(address);

    // Step 7: Business Hours (Optional)
    await this.waitForAIMessage('opening hours');
    await this.sendUserResponse(hours);

    // Step 8: Image Replacement
    await this.waitForAIMessage('replace the current image');
    await this.sendUserResponse('', true, replaceImages ? 'Yes' : 'No');

    // Step 9: Final Confirmation
    await this.waitForAIMessage('generate your website content');
    await this.sendUserResponse('', true, "Yes, Let's Do It!");

    console.log('✅ Business information collection completed');
  }

  /**
   * Monitor AI content generation progress
   * @param {number} timeoutMs - Maximum time to wait for completion
   */
  async monitorContentGeneration(timeoutMs = 300000) { // 5 minutes default
    console.log('🎨 Monitoring AI content generation...');

    const startTime = Date.now();

    // Wait for generation to start
    await this.page.waitForSelector('.ai-generation-progress', { timeout: 30000 });

    while (Date.now() - startTime < timeoutMs) {
      // Check for completion
      const isComplete = await this.page.locator('.ai-generation-complete').isVisible();
      if (isComplete) {
        console.log('✅ AI content generation completed');
        return true;
      }

      // Check for errors
      const hasError = await this.page.locator('.ai-generation-error').isVisible();
      if (hasError) {
        const errorMessage = await this.page.locator('.ai-error-message').textContent();
        throw new Error(`AI generation failed: ${errorMessage}`);
      }

      // Log progress steps
      const progressSteps = await this.page.locator('.progress-step.completed').count();
      const totalSteps = await this.page.locator('.progress-step').count();

      if (totalSteps > 0) {
        console.log(`📈 AI generation progress: ${progressSteps}/${totalSteps} steps completed`);
      }

      await this.page.waitForTimeout(3000);
    }

    throw new Error('AI content generation timed out');
  }

  /**
   * Get conversation history
   * @returns {Array} Array of conversation steps
   */
  getConversationHistory() {
    return this.conversationSteps;
  }

  /**
   * Validate conversation flow
   * @param {Array} expectedSteps - Expected conversation steps
   */
  async validateConversationFlow(expectedSteps) {
    console.log('🔍 Validating AI conversation flow...');

    for (let i = 0; i < expectedSteps.length; i++) {
      const expected = expectedSteps[i];
      const actual = this.conversationSteps[i];

      if (!actual) {
        throw new Error(`Missing conversation step ${i + 1}: ${expected.type}`);
      }

      if (actual.type !== expected.type) {
        throw new Error(`Step ${i + 1} type mismatch: expected ${expected.type}, got ${actual.type}`);
      }
    }

    console.log('✅ Conversation flow validation passed');
  }
}

module.exports = {
  AIConversation
};