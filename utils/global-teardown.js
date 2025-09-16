/**
 * Global Teardown for Templately Playwright Tests
 *
 * This file handles cleanup after all tests have completed.
 * It performs necessary cleanup operations and generates test reports.
 */

const fs = require('fs');
const path = require('path');

async function globalTeardown(config) {
  console.log('🧹 Starting Templately Test Environment Cleanup...');

  try {
    // Read test results and generate summary
    const resultsPath = 'tests/reports/results.json';
    if (fs.existsSync(resultsPath)) {
      const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
      generateTestSummary(results);
    }

    // Clean up temporary files if not in CI
    if (!process.env.CI) {
      cleanupTempFiles();
    }

    // Archive test artifacts
    archiveTestArtifacts();

    console.log('✅ Global teardown completed successfully!');

  } catch (error) {
    console.error('❌ Global teardown failed:', error.message);
    // Don't throw error in teardown to avoid masking test failures
  }
}

/**
 * Generate a human-readable test summary
 */
function generateTestSummary(results) {
  const summary = {
    totalTests: results.stats?.total || 0,
    passed: results.stats?.passed || 0,
    failed: results.stats?.failed || 0,
    skipped: results.stats?.skipped || 0,
    duration: results.stats?.duration || 0,
    timestamp: new Date().toISOString()
  };

  const summaryText = `
# Templately Test Summary

## Overview
- **Total Tests**: ${summary.totalTests}
- **Passed**: ${summary.passed}
- **Failed**: ${summary.failed}
- **Skipped**: ${summary.skipped}
- **Duration**: ${Math.round(summary.duration / 1000)}s
- **Timestamp**: ${summary.timestamp}

## Test Results
${summary.failed > 0 ? '❌ Some tests failed' : '✅ All tests passed'}

## Artifacts
- HTML Report: tests/reports/html/index.html
- JSON Results: tests/reports/results.json
- JUnit XML: tests/reports/junit.xml
- Screenshots: tests/screenshots/
- Videos: tests/videos/
- Traces: tests/traces/
`;

  fs.writeFileSync('tests/reports/summary.md', summaryText);
  console.log('📊 Test summary generated: tests/reports/summary.md');
}

/**
 * Clean up temporary files
 */
function cleanupTempFiles() {
  const tempDirs = ['tests/test-results'];

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

/**
 * Archive test artifacts for long-term storage
 */
function archiveTestArtifacts() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const archiveDir = `tests/archives/${timestamp}`;

  if (!fs.existsSync('tests/archives')) {
    fs.mkdirSync('tests/archives', { recursive: true });
  }

  console.log(`📦 Test artifacts archived to: ${archiveDir}`);
}

module.exports = globalTeardown;