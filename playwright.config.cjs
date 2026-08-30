const path = require('node:path');
const { defineConfig, devices } = require('@playwright/test');

const artifactRoot = path.resolve(__dirname, '..', 'other', 'procurement-demo');

module.exports = defineConfig({
  testDir: './tests/e2e',
  outputDir: path.join(artifactRoot, 'test-results'),
  fullyParallel: false,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: [
    ['list'],
    ['html', { outputFolder: path.join(artifactRoot, 'playwright-report'), open: 'never' }]
  ],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'desktop-1440',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 }
      }
    },
    {
      name: 'desktop-1280',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 }
      }
    }
  ],
  webServer: {
    command: 'node annotation-code-server.js',
    url: 'http://127.0.0.1:4173/order-management.html',
    reuseExistingServer: true,
    timeout: 30_000
  }
});
