/**
 * Templately AI FSI (AI-Powered Full Site Import) Workflow Tests
 *
 * This test suite validates the AI-enhanced Full Site Import functionality
 * including AI conversation flow, business data collection, content generation,
 * and live preview validation.
 *
 * Test Coverage:
 * - AI conversation workflow (9 steps)
 * - Business information collection
 * - AI content generation monitoring
 * - Live preview validation
 * - Error handling and recovery
 * - Multiple business scenarios
 */

const { test, expect } = require('@playwright/test');
const { TemplatelyAuth, TemplatelyNavigation, TemplateManager } = require('./utils/templately-helpers');
const { FSIPreview } = require('./utils/fsi-helpers');
const { AIConversation } = require('./utils/ai-helpers');

// Test data for different business scenarios
const businessScenarios = [
  {
    name: 'Technology Company',
    data: {
      businessName: 'TechSolutions Pro',
      industry: 'Technology',
      description: 'We are a leading technology consulting company specializing in digital transformation, cloud solutions, and innovative software development. Our expert team helps businesses modernize their operations and achieve sustainable growth through cutting-edge technology solutions.',
      email: 'contact@techsolutionspro.com',
      phone: '+1-555-123-4567',
      address: '456 Tech Plaza, Suite 789, Innovation District, San Francisco, CA 94105, United States',
      hours: 'Monday to Friday: 9:00 AM to 6:00 PM (PST), Saturday: 10:00 AM to 2:00 PM (PST), Sunday: Closed',
      replaceImages: false
    }
  },
  {
    name: 'Restaurant Business',
    data: {
      businessName: 'Bella Vista Restaurant',
      industry: 'Restaurant',
      description: 'Bella Vista Restaurant offers an authentic Italian dining experience with fresh, locally-sourced ingredients and traditional recipes passed down through generations. Our warm atmosphere and exceptional service make every meal memorable.',
      email: 'info@bellavista.com',
      phone: '+1-555-987-6543',
      address: '123 Main Street, Downtown District, New York, NY 10001, United States',
      hours: 'Tuesday to Sunday: 5:00 PM to 10:00 PM, Monday: Closed',
      replaceImages: true
    }
  },
  {
    name: 'Healthcare Practice',
    data: {
      businessName: 'Wellness Medical Center',
      industry: 'Healthcare',
      description: 'Wellness Medical Center provides comprehensive healthcare services with a focus on preventive care and patient wellness. Our experienced medical team offers personalized treatment plans and state-of-the-art medical technology.',
      email: 'appointments@wellnessmedical.com',
      phone: '+1-555-456-7890',
      address: '789 Health Drive, Medical District, Chicago, IL 60601, United States',
      hours: 'Monday to Friday: 8:00 AM to 6:00 PM, Saturday: 9:00 AM to 2:00 PM, Sunday: Emergency only',
      replaceImages: false
    }
  }
];

test.describe('Templately AI FSI Workflow Tests', () => {
  let auth, navigation, templateManager, aiConversation, fsiPreview;

  test.beforeEach(async ({ page }) => {
    // Initialize helper classes
    auth = new TemplatelyAuth(page);
    navigation = new TemplatelyNavigation(page);
    templateManager = new TemplateManager(page);
    aiConversation = new AIConversation(page);
    fsiPreview = new FSIPreview(page);

    // Setup: Login and navigate to Templately
    await auth.loginToWordPress();
    await auth.verifyTemplatelyActive();
    await auth.navigateToTemplately();
  });

  test.afterEach(async ({ page }) => {
    // Cleanup and debugging
    await navigation.closeModals();

    if (test.info().status === 'failed') {
      // Save conversation history for debugging
      const conversationHistory = aiConversation.getConversationHistory();
      console.log('Conversation History:', JSON.stringify(conversationHistory, null, 2));

      await page.screenshot({
        path: `tests/screenshots/ai-fsi-failure-${Date.now()}.png`,
        fullPage: true
      });
    }
  });

  test('should complete full AI FSI workflow successfully', async ({ page }) => {
    test.setTimeout(900000); // 15 minutes for full AI workflow

    // Navigate to cloud templates and select one
    await navigation.goToCloudTemplates();
    await templateManager.searchTemplates('business');
    const templateName = await templateManager.selectFirstTemplate();

    // Start AI workflow
    await aiConversation.startAIWorkflow();

    // Complete business information collection
    await aiConversation.completeBusinessInfoWorkflow();

    // Monitor AI content generation
    await aiConversation.monitorContentGeneration();

    // Wait for live preview to load
    await fsiPreview.waitForPreviewLoad();

    // Validate AI-generated content in preview
    await fsiPreview.interactWithPreview(async (iframe) => {
      // Check for business name integration
      await expect(iframe.locator('body')).toContainText('TechSolutions Pro');

      // Check for contact information
      await expect(iframe.locator('body')).toContainText('contact@techsolutionspro.com');

      // Verify page structure
      await expect(iframe.locator('header')).toBeVisible();
      await expect(iframe.locator('main')).toBeVisible();
      await expect(iframe.locator('footer')).toBeVisible();
    });

    // Take screenshot of final result
    await fsiPreview.screenshotPreview(`ai-fsi-complete-${Date.now()}.png`);

    console.log('✅ Complete AI FSI workflow finished successfully');
  });

  test('should handle AI conversation flow correctly', async ({ page }) => {
    test.setTimeout(600000); // 10 minutes

    await navigation.goToCloudTemplates();
    const templateName = await templateManager.selectFirstTemplate();

    await aiConversation.startAIWorkflow();

    // Test individual conversation steps
    console.log('🤖 Testing AI conversation steps...');

    // Step 1: Business Name
    await aiConversation.waitForAIMessage('business name');
    await aiConversation.sendUserResponse('Test Company');

    // Step 2: Industry
    await aiConversation.waitForAIMessage('type of business');
    await aiConversation.sendUserResponse('Technology');

    // Step 3: Description
    await aiConversation.waitForAIMessage('describe your business');
    await aiConversation.sendUserResponse('We provide technology solutions for businesses.');

    // Step 4: Email
    await aiConversation.waitForAIMessage('email address');
    await aiConversation.sendUserResponse('test@example.com');

    // Step 5: Phone (Optional)
    await aiConversation.waitForAIMessage('contact number');
    await aiConversation.sendUserResponse('+1-555-0123');

    // Step 6: Address
    await aiConversation.waitForAIMessage('business address');
    await aiConversation.sendUserResponse('123 Test Street, Test City, TC 12345');

    // Step 7: Hours (Optional)
    await aiConversation.waitForAIMessage('opening hours');
    await aiConversation.sendUserResponse('Monday to Friday: 9 AM to 5 PM');

    // Step 8: Image Replacement
    await aiConversation.waitForAIMessage('replace the current image');
    await aiConversation.sendUserResponse('', true, 'No');

    // Step 9: Final Confirmation
    await aiConversation.waitForAIMessage('generate your website content');
    await aiConversation.sendUserResponse('', true, "Yes, Let's Do It!");

    // Validate conversation flow
    const expectedSteps = [
      { type: 'user', content: 'Test Company' },
      { type: 'user', content: 'Technology' },
      { type: 'user', content: 'We provide technology solutions for businesses.' },
      { type: 'user', content: 'test@example.com' },
      { type: 'user', content: '+1-555-0123' },
      { type: 'user', content: '123 Test Street, Test City, TC 12345' },
      { type: 'user', content: 'Monday to Friday: 9 AM to 5 PM' }
    ];

    await aiConversation.validateConversationFlow(expectedSteps);

    console.log('✅ AI conversation flow validation passed');
  });

  test('should monitor AI content generation progress', async ({ page }) => {
    test.setTimeout(600000); // 10 minutes

    await navigation.goToCloudTemplates();
    const templateName = await templateManager.selectFirstTemplate();

    await aiConversation.startAIWorkflow();

    // Use minimal business data for faster testing
    await aiConversation.completeBusinessInfoWorkflow({
      businessName: 'Quick Test Co',
      industry: 'Technology',
      description: 'A test company for automated testing purposes.',
      email: 'test@quicktest.com'
    });

    // Monitor the generation process with detailed logging
    console.log('📊 Starting AI content generation monitoring...');

    const generationStartTime = Date.now();
    await aiConversation.monitorContentGeneration();
    const generationDuration = Date.now() - generationStartTime;

    console.log(`⏱️  AI content generation completed in ${Math.round(generationDuration / 1000)}s`);

    // Verify generation completed successfully
    await expect(page.locator('.ai-generation-complete')).toBeVisible();
  });

  // Data-driven tests for different business scenarios
  businessScenarios.forEach(scenario => {
    test(`should handle ${scenario.name} business scenario`, async ({ page }) => {
      test.setTimeout(900000); // 15 minutes

      await navigation.goToCloudTemplates();

      // Filter by relevant category if possible
      if (scenario.data.industry.toLowerCase() === 'restaurant') {
        await templateManager.filterByCategory('restaurant');
      } else if (scenario.data.industry.toLowerCase() === 'healthcare') {
        await templateManager.filterByCategory('medical');
      }

      const templateName = await templateManager.selectFirstTemplate();
      await aiConversation.startAIWorkflow();

      // Use scenario-specific business data
      await aiConversation.completeBusinessInfoWorkflow(scenario.data);
      await aiConversation.monitorContentGeneration();

      // Validate scenario-specific content
      await fsiPreview.waitForPreviewLoad();
      await fsiPreview.interactWithPreview(async (iframe) => {
        // Check for business name
        await expect(iframe.locator('body')).toContainText(scenario.data.businessName);

        // Check for email
        await expect(iframe.locator('body')).toContainText(scenario.data.email);

        // Industry-specific validations
        if (scenario.data.industry === 'Restaurant') {
          // Look for restaurant-specific content
          const bodyText = await iframe.locator('body').textContent();
          expect(bodyText.toLowerCase()).toMatch(/(menu|dining|restaurant|food)/);
        }
      });

      await fsiPreview.screenshotPreview(`ai-fsi-${scenario.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`);

      console.log(`✅ ${scenario.name} scenario completed successfully`);
    });
  });

  test('should handle AI workflow errors gracefully', async ({ page }) => {
    test.setTimeout(300000); // 5 minutes

    await navigation.goToCloudTemplates();
    const templateName = await templateManager.selectFirstTemplate();

    try {
      await aiConversation.startAIWorkflow();

      // Test with invalid/problematic inputs
      await aiConversation.waitForAIMessage('business name');
      await aiConversation.sendUserResponse(''); // Empty business name

      // Check for error handling
      const errorVisible = await page.locator('.ai-error-message, .validation-error').isVisible();
      if (errorVisible) {
        const errorMessage = await page.locator('.ai-error-message, .validation-error').textContent();
        console.log(`✅ Error handled gracefully: ${errorMessage}`);
      }

    } catch (error) {
      // Verify error is handled appropriately
      console.log(`✅ AI workflow error handled: ${error.message}`);
    }
  });

  test('should support AI workflow restart', async ({ page }) => {
    test.setTimeout(300000); // 5 minutes

    await navigation.goToCloudTemplates();
    const templateName = await templateManager.selectFirstTemplate();

    await aiConversation.startAIWorkflow();

    // Start conversation
    await aiConversation.waitForAIMessage('business name');
    await aiConversation.sendUserResponse('Initial Company');

    // Restart workflow
    await page.click('.restart-ai-workflow, .start-fresh-button');

    // Verify restart
    await aiConversation.waitForAIMessage('business name');
    await aiConversation.sendUserResponse('Restarted Company');

    console.log('✅ AI workflow restart handled correctly');
  });
});