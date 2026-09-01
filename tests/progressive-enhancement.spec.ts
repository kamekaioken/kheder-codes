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

		await expect(page.getByTestId('wordmark')).toHaveText(/KHEDER\s*\.codes/);
		await expect(page.locator('h1')).toHaveText(
			'Servus, wir sind KHEDER.codes.',
		);
		await expect(page.getByTestId('hero')).toBeVisible();
		await expect(page.getByTestId('terminal')).toBeVisible();
		await expect(page.getByTestId('menu-home')).toBeVisible();
		await expect(page.getByTestId('menu-team')).toBeVisible();
		await expect(page.getByTestId('menu-settings')).toBeVisible();
	});

	test('menu rows are ordinary links that still navigate', async ({ page }) => {
		await page.goto(routes.de.home);

		await page.getByTestId('menu-refs').click(clickOptions);
		await expect(page).toHaveURL(new RegExp(`${routes.de.refs}/?$`));
		await expect(page.locator('h1')).toHaveText('Referenzen');
	});

	test('content pages render their copy', async ({ page }) => {
		await page.goto(routes.de.home);

		await expect(page.locator('h1')).toHaveText(
			'Servus, wir sind KHEDER.codes.',
		);
		await expect(page.locator('main')).toContainText('Kheder, Alan und Andrej');
		await expect(page.locator('footer')).toBeVisible();
	});

	// Settings has no page to fall back on, so the panel it lives in has to be in
	// the served markup — otherwise nothing could unfold it and the language
	// switch would be unreachable.
	test('the settings panel is served open, and the language switch is a plain link', async ({
		page,
	}) => {
		await page.goto(routes.de.refs);

		await expect(page.getByTestId('settings-submenu')).toBeVisible();
		await expect(page.getByTestId('lang-en')).toHaveAttribute(
			'href',
			routes.en.refs,
		);

		await page.getByTestId('lang-en').click(clickOptions);
		await expect(page).toHaveURL(new RegExp(`${routes.en.refs}/?$`));
		await expect(page.locator('h1')).toHaveText('References');
	});

	test('team profiles are reachable and readable', async ({ page }) => {
		await page.goto(routes.de.team);

		await page.getByTestId('member-2').click(clickOptions);
		await expect(page).toHaveURL(new RegExp('/team/alan-kerkuki/?$'));
		await expect(page.locator('h1')).toHaveText('Alan Kerkuki');

		await page.getByTestId('doc-next').click(clickOptions);
		await expect(page.locator('h1')).toHaveText('Andrej Ilnizkij');
	});

	test('blog entries link to their article', async ({ page }) => {
		await page.goto(routes.de.blog);

		await page.getByTestId('post-1').click(clickOptions);
		await expect(page).toHaveURL(
			new RegExp('/blog/voice-agents-mit-livekit/?$'),
		);
	});
});
