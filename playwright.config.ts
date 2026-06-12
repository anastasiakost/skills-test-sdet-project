import { defineConfig, devices } from '@playwright/test';
import { STORAGE_STATE, env } from './src/config/env';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: env.isCI,
  retries: env.isCI ? 2 : 0,
  workers: env.isCI ? 4 : undefined,

  reporter: env.isCI
    ? [['blob'], ['github'], ['list']]
    : [['html', { open: 'never', outputFolder: 'playwright-report' }], ['list']],

  use: {
    baseURL: env.baseUrl,
    headless: env.isCI || !env.headed,
    trace: env.isCI ? 'on-first-retry' : 'off',
    screenshot: env.isCI ? 'only-on-failure' : 'off',
    video: env.isCI ? 'retain-on-failure' : 'off',
  },

  projects: [
    {
      name: 'setup',
      testMatch: /tests[\\/]setup[\\/].*\.setup\.ts/,
    },
    {
      name: 'e2e',
      testDir: './tests/e2e',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: STORAGE_STATE,
      },
    },
    {
      name: 'api',
      testDir: './tests/api',
      dependencies: ['setup'],
    },
  ],
});
