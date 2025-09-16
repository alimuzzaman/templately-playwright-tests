# Templately Playwright MCP Test Suite

This comprehensive test suite validates both traditional FSI (Full Site Import) and AI-powered FSI workflows in the Templately WordPress plugin using Playwright with MCP (Model Context Protocol) integration.

## 🎯 Test Coverage

### FSI (Full Site Import) Tests
- Template selection and preview
- Dependency checking and installation
- Import progress monitoring
- Customization options
- Import validation and cleanup
- Error handling and recovery

### AI FSI (AI-Powered Full Site Import) Tests
- Complete AI conversation workflow (9 steps)
- Business information collection
- AI content generation monitoring
- Live preview validation
- Multiple business scenarios
- Error handling and restart functionality

## 📁 Project Structure

```
tests/
├── playwright.config.js          # Playwright configuration optimized for MCP
├── fsi-workflow.test.js          # Traditional FSI workflow tests
├── ai-fsi-workflow.test.js       # AI-powered FSI workflow tests
├── setup.test.js                 # Environment setup and validation
├── teardown.test.js              # Cleanup and reporting
├── utils/                        # Reusable utility functions
│   ├── global-setup.js           # Global test environment setup
│   ├── global-teardown.js        # Global cleanup and reporting
│   ├── templately-helpers.js     # Templately-specific utilities
│   ├── fsi-helpers.js            # FSI workflow utilities
│   └── ai-helpers.js             # AI conversation utilities
├── data/                         # Test data and configuration
│   ├── test-business-data.json   # Business scenarios for AI testing
│   ├── environment-info.json     # Environment information (generated)
│   └── setup-data.json           # Setup data (generated)
├── reports/                      # Test reports and results
│   ├── html/                     # HTML test reports
│   ├── results.json              # JSON test results
│   ├── junit.xml                 # JUnit XML results
│   └── summary.md                # Human-readable summary
├── screenshots/                  # Test screenshots
├── videos/                       # Test videos (on failure)
├── traces/                       # Playwright traces (on failure)
└── archives/                     # Archived test artifacts
```

## 🚀 Getting Started

### Prerequisites

1. **WordPress Installation**: Running WordPress instance with admin access
2. **Templately Plugin**: Installed and activated
3. **Node.js**: Version 16 or higher
4. **Playwright**: Installed with browsers

### Installation

1. **Install Dependencies**:
   ```bash
   npm install @playwright/test
   npx playwright install
   ```

2. **Environment Configuration**:
   Create a `.env` file in the project root:
   ```env
   WP_BASE_URL=http://localhost:8080
   WP_USERNAME=admin
   WP_PASSWORD=password
   ```

3. **WordPress Setup**:
   - Ensure WordPress is running and accessible
   - Templately plugin is installed and activated
   - Admin user credentials are configured

## 🎮 Running Tests

### Quick Start
```bash
# Run all tests
npx playwright test

# Run specific test suite
npx playwright test fsi-workflow.test.js
npx playwright test ai-fsi-workflow.test.js

# Run with UI mode for debugging
npx playwright test --ui

# Run in headed mode to see browser
npx playwright test --headed
```

### Test Execution Options

```bash
# Run setup only
npx playwright test setup.test.js

# Run FSI tests only
npx playwright test fsi-workflow.test.js

# Run AI FSI tests only
npx playwright test ai-fsi-workflow.test.js

# Run teardown only
npx playwright test teardown.test.js

# Run with specific browser
npx playwright test --project=fsi-chrome
npx playwright test --project=ai-fsi-firefox

# Run with debug mode
npx playwright test --debug

# Generate and show HTML report
npx playwright show-report
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `WP_BASE_URL` | WordPress base URL | `http://localhost:8080` |
| `WP_USERNAME` | WordPress admin username | `admin` |
| `WP_PASSWORD` | WordPress admin password | `password` |
| `CI` | CI environment flag | `false` |

## 🔧 MCP Integration Benefits

The test suite is optimized for MCP (Model Context Protocol) integration, providing:

### Real-time Browser Automation
- Live browser interaction through MCP server
- Step-by-step debugging capabilities
- Interactive test execution

### Visual Debugging
- Automatic screenshot capture on failures
- Video recording for complex workflows
- Playwright trace files for detailed analysis

### Dynamic Test Adaptation
- Real-time test modification through MCP
- Interactive test parameter adjustment
- Live test result analysis

## 📊 Test Scenarios

### Business Data Scenarios
The test suite includes comprehensive business scenarios:

1. **Technology Company**
   - Digital transformation services
   - Cloud solutions and software development
   - B2B technology consulting

2. **Restaurant Business**
   - Italian dining experience
   - Local ingredients and traditional recipes
   - Hospitality and dining services

3. **Healthcare Practice**
   - Medical services and patient care
   - Preventive healthcare focus
   - Professional medical team

4. **E-commerce Store**
   - Fashion and retail
   - Online shopping experience
   - Customer service focus

5. **Business Consulting**
   - Strategic business advisory
   - Operations optimization
   - Growth consulting services

### Template Categories
- Business templates (15+ expected)
- Portfolio templates (10+ expected)
- E-commerce templates (8+ expected)
- Restaurant templates (6+ expected)
- Medical templates (5+ expected)

## 🛠️ Utility Functions

### TemplatelyAuth
- WordPress login/logout
- Plugin activation verification
- Admin navigation

### TemplatelyNavigation
- Template library navigation
- Cloud template browsing
- Modal management

### TemplateManager
- Template search and filtering
- Category-based selection
- Template counting and validation

### FSIWorkflow
- Import process management
- Dependency handling
- Progress monitoring
- Customization options

### FSIPreview
- Preview iframe interaction
- Content validation
- Screenshot capture

### AIConversation
- AI workflow initiation
- Conversation step management
- Business data collection
- Content generation monitoring

## 📈 Reporting and Analysis

### Automated Reports
- **HTML Report**: Interactive test results with screenshots
- **JSON Results**: Machine-readable test data
- **JUnit XML**: CI/CD integration format
- **Markdown Summary**: Human-readable overview

### Debugging Artifacts
- **Screenshots**: Captured on test failures
- **Videos**: Recorded for failed test runs
- **Traces**: Detailed Playwright execution traces
- **Logs**: Console output and error messages

### Test Metrics
- Test execution duration
- Success/failure rates
- Coverage analysis
- Performance benchmarks

## 🔍 Troubleshooting

### Common Issues

1. **WordPress Not Accessible**
   ```bash
   # Check WordPress is running
   curl http://localhost:8080

   # Verify database connection
   wp db check
   ```

2. **Templately Plugin Issues**
   ```bash
   # Check plugin status
   wp plugin status templately

   # Activate if needed
   wp plugin activate templately
   ```

3. **Test Timeouts**
   - Increase timeout values in `playwright.config.js`
   - Check network connectivity
   - Verify server performance

4. **Browser Issues**
   ```bash
   # Reinstall browsers
   npx playwright install

   # Clear browser data
   npx playwright install --force
   ```

### Debug Mode

Run tests in debug mode for step-by-step execution:
```bash
npx playwright test --debug --headed
```

### Verbose Logging

Enable detailed logging:
```bash
DEBUG=pw:api npx playwright test
```

## 🤝 Contributing

### Adding New Tests

1. **Create Test File**: Follow naming convention `*.test.js`
2. **Use Utilities**: Leverage existing helper functions
3. **Add Documentation**: Include JSDoc comments
4. **Update Data**: Add test scenarios to `test-business-data.json`

### Utility Development

1. **Follow Patterns**: Use existing utility class structures
2. **Add JSDoc**: Document all public methods
3. **Error Handling**: Implement robust error handling
4. **Logging**: Add appropriate console logging

### Test Data

Update `tests/data/test-business-data.json` for new scenarios:
- Business information
- Expected content validation
- Template categories
- Configuration options

## 📝 Best Practices

### Test Organization
- Group related tests in describe blocks
- Use descriptive test names
- Implement proper setup/teardown

### Error Handling
- Capture screenshots on failures
- Log detailed error information
- Implement retry mechanisms

### Performance
- Use parallel execution where possible
- Optimize wait times and timeouts
- Clean up resources properly

### Maintenance
- Regular dependency updates
- Test data refresh
- Documentation updates

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review test logs and artifacts
3. Consult Playwright documentation
4. Contact the development team

---

**Note**: This test suite is designed for comprehensive validation of Templately's FSI and AI FSI workflows. Regular execution helps ensure plugin reliability and user experience quality.