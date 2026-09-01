import { defineConfig, devices } from '@playwright/test';

const port = 4321;

export default defineConfig({
	testDir: './tests',
	fullyParallel: true,
	forbidOnly: Boolean(process.env.CI),
	retries: process.env.CI ? 2 : 0,
	reporter: process.env.CI ? 'github' : [['list']],
	use: {
		baseURL: `http://localhost:${port}`,
		trace: 'on-first-retry',
	},
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
	// `astro preview` daemonises itself, so Playwright's webServer helper cannot
	// supervise it. Build and start it through Astro's own background commands.
	globalSetup: './tests/global-setup.ts',
	globalTeardown: './tests/global-teardown.ts',
});
