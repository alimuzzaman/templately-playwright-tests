/**
 * Playwright Configuration for Templately Test Suite
 * Optimized for MCP (Model Context Protocol) integration
 */

const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  // Test directory
  testDir: '.',
  
  // Global setup and teardown
  globalSetup: require.resolve('./utils/global-setup.js'),
  globalTeardown: require.resolve('./utils/global-teardown.js'),
  
  // Test execution settings
  fullyParallel: false, // Sequential execution for WordPress tests
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : 1, // Single worker for WordPress stability
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'reports/html' }],
    ['json', { outputFile: 'reports/results.json' }],
    ['junit', { outputFile: 'reports/junit.xml' }],
    ['list']
  ],
  
  // Global test settings
  use: {
    // Base URL for WordPress installation
    baseURL: process.env.WP_BASE_URL || 'http://localhost:8080',
    
    // Browser settings
    headless: !process.env.HEADED,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    
    // Screenshots and videos
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    
    // Timeouts
    actionTimeout: 30000,
    navigationTimeout: 60000,
  },
  
  // Test timeout
  timeout: 300000, // 5 minutes per test
  expect: {
    timeout: 30000
  },
  
  // Projects for different browsers and test types
  projects: [
    {
      name: 'fsi-chrome',
      testMatch: ['setup.test.js', 'fsi-workflow.test.js', 'teardown.test.js'],
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'ai-fsi-chrome',
      testMatch: ['setup.test.js', 'ai-fsi-workflow.test.js', 'teardown.test.js'],
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'fsi-firefox',
      testMatch: ['setup.test.js', 'fsi-workflow.test.js', 'teardown.test.js'],
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'ai-fsi-firefox',
      testMatch: ['setup.test.js', 'ai-fsi-workflow.test.js', 'teardown.test.js'],
      use: { ...devices['Desktop Firefox'] },
    }
  ],
  
  // Output directories
  outputDir: 'test-results/',
  
  // Web server (if needed for local WordPress)
  // webServer: {
  //   command: 'wp server --host=localhost --port=8080',
  //   port: 8080,
  //   reuseExistingServer: !process.env.CI,
  // },
});
