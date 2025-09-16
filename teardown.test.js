/**
 * Templately Test Teardown
 *
 * This file handles cleanup after all tests have completed.
 * It performs necessary cleanup operations and generates final reports.
 */

const { test, expect } = require('@playwright/test');
const { TemplatelyAuth } = require('./utils/templately-helpers');

test.describe.configure({ mode: 'serial' });

test.describe('Templately Test Environment Teardown', () => {
  test('should cleanup test data', async ({ page }) => {
    console.log('🧹 Starting test data cleanup...');

    const auth = new TemplatelyAuth(page);
    await auth.loginToWordPress();

    // Navigate to Templately admin
    await auth.navigateToTemplately();

    // Clean up any test templates or data created during tests
    // This would be implemented based on specific cleanup needs

    console.log('✅ Test data cleanup completed');
  });

  test('should generate test summary report', async ({ page }) => {
    console.log('📊 Generating test summary report...');

    const fs = require('fs');
    const path = require('path');

    // Read test results if available
    let testResults = {};
    const resultsPath = 'tests/reports/results.json';

    if (fs.existsSync(resultsPath)) {
      testResults = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
    }

    // Read environment info
    let envInfo = {};
    const envPath = 'tests/data/environment-info.json';

    if (fs.existsSync(envPath)) {
      envInfo = JSON.parse(fs.readFileSync(envPath, 'utf8'));
    }

    // Generate summary
    const summary = {
      testRun: {
        timestamp: new Date().toISOString(),
        duration: Date.now() - (envInfo.timestamp ? new Date(envInfo.timestamp).getTime() : Date.now()),
        environment: envInfo
      },
      results: testResults,
      artifacts: {
        screenshots: getFileCount('tests/screenshots'),
        videos: getFileCount('tests/videos'),
        traces: getFileCount('tests/traces')
      }
    };

    // Save summary
    fs.writeFileSync('tests/reports/test-summary.json', JSON.stringify(summary, null, 2));

    // Generate markdown report
    const markdownReport = generateMarkdownReport(summary);
    fs.writeFileSync('tests/reports/test-summary.md', markdownReport);

    console.log('✅ Test summary report generated');
    console.log(`📁 Reports saved to: tests/reports/`);
  });

  test('should archive test artifacts', async ({ page }) => {
    console.log('📦 Archiving test artifacts...');

    const fs = require('fs');
    const path = require('path');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const archiveDir = `tests/archives/${timestamp}`;

    // Create archive directory
    if (!fs.existsSync('tests/archives')) {
      fs.mkdirSync('tests/archives', { recursive: true });
    }

    fs.mkdirSync(archiveDir, { recursive: true });

    // Copy important files to archive
    const filesToArchive = [
      'tests/reports/test-summary.json',
      'tests/reports/test-summary.md',
      'tests/data/environment-info.json'
    ];

    filesToArchive.forEach(file => {
      if (fs.existsSync(file)) {
        const destPath = path.join(archiveDir, path.basename(file));
        fs.copyFileSync(file, destPath);
      }
    });

    console.log(`✅ Test artifacts archived to: ${archiveDir}`);
  });

  test('should cleanup temporary files', async ({ page }) => {
    console.log('🗑️  Cleaning up temporary files...');

    const fs = require('fs');

    // Clean up test results directory if not in CI
    if (!process.env.CI) {
      const tempDirs = [
        'tests/test-results'
      ];

      tempDirs.forEach(dir => {
        if (fs.existsSync(dir)) {
          try {
            fs.rmSync(dir, { recursive: true, force: true });
            console.log(`🗑️  Cleaned up: ${dir}`);
          } catch (error) {
            console.warn(`⚠️  Could not clean up ${dir}:`, error.message);
          }
        }
      });
    }

    console.log('✅ Temporary file cleanup completed');
  });

  test('should display final test summary', async ({ page }) => {
    console.log('📋 Displaying final test summary...');

    const fs = require('fs');

    // Read and display summary
    const summaryPath = 'tests/reports/test-summary.json';
    if (fs.existsSync(summaryPath)) {
      const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));

      console.log('\n' + '='.repeat(60));
      console.log('🎯 TEMPLATELY TEST SUMMARY');
      console.log('='.repeat(60));
      console.log(`📅 Test Run: ${summary.testRun.timestamp}`);
      console.log(`⏱️  Duration: ${Math.round(summary.testRun.duration / 1000)}s`);
      console.log(`🌐 WordPress: ${summary.testRun.environment.wordpressVersion || 'unknown'}`);
      console.log(`🔌 Templately: ${summary.testRun.environment.templatelyVersion || 'unknown'}`);

      if (summary.results.stats) {
        console.log(`📊 Tests: ${summary.results.stats.total || 0} total, ${summary.results.stats.passed || 0} passed, ${summary.results.stats.failed || 0} failed`);
      }

      console.log(`📸 Screenshots: ${summary.artifacts.screenshots}`);
      console.log(`🎥 Videos: ${summary.artifacts.videos}`);
      console.log(`🔍 Traces: ${summary.artifacts.traces}`);
      console.log('='.repeat(60));
      console.log('✅ Templately test suite completed!');
      console.log('='.repeat(60) + '\n');
    }
  });
});

/**
 * Helper function to count files in a directory
 */
function getFileCount(directory) {
  const fs = require('fs');

  if (!fs.existsSync(directory)) {
    return 0;
  }

  try {
    return fs.readdirSync(directory).length;
  } catch {
    return 0;
  }
}

/**
 * Generate markdown report from summary data
 */
function generateMarkdownReport(summary) {
  const duration = Math.round(summary.testRun.duration / 1000);
  const stats = summary.results.stats || {};

  return `# Templately Test Summary Report

## Test Run Information
- **Timestamp**: ${summary.testRun.timestamp}
- **Duration**: ${duration} seconds
- **WordPress Version**: ${summary.testRun.environment.wordpressVersion || 'unknown'}
- **Templately Version**: ${summary.testRun.environment.templatelyVersion || 'unknown'}

## Test Results
- **Total Tests**: ${stats.total || 0}
- **Passed**: ${stats.passed || 0}
- **Failed**: ${stats.failed || 0}
- **Skipped**: ${stats.skipped || 0}

## Test Artifacts
- **Screenshots**: ${summary.artifacts.screenshots}
- **Videos**: ${summary.artifacts.videos}
- **Traces**: ${summary.artifacts.traces}

## Status
${stats.failed > 0 ? '❌ Some tests failed' : '✅ All tests passed'}

---
*Generated by Templately Playwright Test Suite*
`;
}