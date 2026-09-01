import { expect, test } from '@playwright/test';
import { routes } from './helpers';

test.describe('without JavaScript', () => {
	test.use({ javaScriptEnabled: false });

	// Playwright's actionability checks need rAF in the page, which Chromium does
	// not service while script execution is disabled, so clicks are forced here.
	const clickOptions = { force: true } as const;

	test('the home page shows the wordmark and the full menu', async ({
		page,
	}) => {
		await page.goto(routes.de.home);

		await expect(page.locator('h1')).toHaveText(/KHEDER\s*\.codes/);
		await expect(page.getByTestId('hero')).toBeVisible();
		await expect(page.getByTestId('terminal')).toBeVisible();
		await expect(page.getByTestId('menu-about')).toBeVisible();
		await expect(page.getByTestId('menu-settings')).toBeVisible();
	});

	test('menu rows are ordinary links that still navigate', async ({ page }) => {
		await page.goto(routes.de.home);

		await page.getByTestId('menu-refs').click(clickOptions);
		await expect(page).toHaveURL(new RegExp(`${routes.de.refs}/?$`));
		await expect(page.locator('h2')).toHaveText('Referenzen');
	});

	test('content pages render their copy', async ({ page }) => {
		await page.goto(routes.de.about);

		await expect(page.locator('h2')).toHaveText('Servus, ich bin Kheder.');
		await expect(page.locator('main')).toContainText('12 Jahren Erfahrung');
		await expect(page.locator('footer')).toBeVisible();
	});

	test('the language switch works as a plain link', async ({ page }) => {
		await page.goto(routes.de.settings);

		await page.getByTestId('lang-en').click(clickOptions);
		await expect(page).toHaveURL(new RegExp(`${routes.en.settings}/?$`));
		await expect(page.locator('h2')).toHaveText('Settings');
	});

	test('blog entries link to their article', async ({ page }) => {
		await page.goto(routes.de.blog);

		await page.getByTestId('post-1').click(clickOptions);
		await expect(page).toHaveURL(
			new RegExp('/blog/voice-agents-mit-livekit/?$'),
		);
	});
});
