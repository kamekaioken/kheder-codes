import { expect, test } from '@playwright/test';
import { openSettings, routes, waitForMenu } from './helpers';

test.describe('settings submenu', () => {
	test('unfolds over the page instead of navigating anywhere', async ({
		page,
	}) => {
		await page.goto(routes.de.refs);
		await openSettings(page);

		await expect(page).toHaveURL(new RegExp(`${routes.de.refs}/?$`));
		await expect(page.locator('h1')).toHaveText('Referenzen');
		await expect(page.getByTestId('main-menu')).toHaveCSS('opacity', '0.4');
		await expect(page.getByTestId('term-title')).toHaveText(
			'kheder — ~/einstellungen — 80×24',
		);
		await expect(page.getByTestId('settings-submenu')).toContainText(
			'kheder einstellungen',
		);
		await expect(page.getByTestId('settings-submenu')).toContainText(
			'sprache & darstellung:',
		);

		await expect(page.getByTestId('settings-language')).toContainText(
			'sprache',
		);
		await expect(page.getByTestId('settings-theme')).toContainText('theme');
		await expect(page.getByTestId('hint-line')).toHaveText(
			'↑↓ zeile · ←→ wert · ⏎ übernehmen · ⎋ zurück',
		);
	});

	test('the menu row is a button that says whether the panel is open', async ({
		page,
	}) => {
		await page.goto(routes.de.refs);
		await waitForMenu(page);

		const row = page.getByTestId('menu-settings');
		await expect(row).toHaveRole('button');
		await expect(row).not.toHaveAttribute('href', /.*/);
		await expect(row).toHaveAttribute('aria-expanded', 'false');

		await row.click();
		await expect(row).toHaveAttribute('aria-expanded', 'true');
	});

	// Settings is a panel, not a page. The old paths are redirected at the edge
	// by `_redirects`, which `astro preview` does not apply — here nothing is
	// built under them at all.
	test('nothing is built under the old settings paths', async ({ request }) => {
		for (const path of ['/einstellungen', '/en/settings']) {
			expect((await request.get(path)).status(), path).toBe(404);
		}
	});

	test('the number key opens it without leaving the page', async ({ page }) => {
		await page.goto(routes.de.contact);
		await waitForMenu(page);

		await page.keyboard.press('7');

		await expect(page.getByTestId('settings-submenu')).toBeVisible();
		await expect(page).toHaveURL(new RegExp(`${routes.de.contact}/?$`));
		await expect(page.locator('h1')).toHaveText('Sag hallo.');
	});

	// Clicking the row leaves the focus on it. It is a disclosure, so the focus
	// stays put — but an open panel has first claim on ⏎.
	test('the keyboard drives the panel right after a click opened it', async ({
		page,
	}) => {
		await page.goto(routes.de.refs);
		await openSettings(page);

		await expect(page.getByTestId('menu-settings')).toBeFocused();

		await page.keyboard.press('ArrowDown');
		await page.keyboard.press('ArrowRight');
		await page.keyboard.press('Enter');

		await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
		await expect(page.getByTestId('settings-submenu')).toBeVisible();
	});

	test('offers deutsch/english and marks the active language', async ({
		page,
	}) => {
		await page.goto(routes.de.refs);
		await openSettings(page);

		await expect(page.getByTestId('lang-de')).toContainText('deutsch');
		await expect(page.getByTestId('lang-en')).toContainText('english');
		await expect(page.getByTestId('lang-de')).toHaveAttribute(
			'aria-current',
			'true',
		);
		await expect(page.getByTestId('lang-en')).not.toHaveAttribute(
			'aria-current',
			'true',
		);
		await expect(page.getByTestId('lang-en')).toHaveAttribute(
			'href',
			routes.en.refs,
		);
	});

	// The legal documents are German only, so there is no counterpart to link.
	// Hiding the row would hide the one control somebody opened the panel for.
	test('a german-only page still offers english, pointing at its home page', async ({
		page,
	}) => {
		await page.goto(routes.de.imprint);
		await openSettings(page);

		await expect(page.getByTestId('lang-en')).toHaveAttribute(
			'href',
			routes.en.home,
		);
	});

	test('offers system/light/dark with system active by default', async ({
		page,
	}) => {
		await page.goto(routes.de.refs);
		await openSettings(page);

		await expect(page.getByTestId('theme-system')).toContainText('system');
		await expect(page.getByTestId('theme-light')).toContainText('light');
		await expect(page.getByTestId('theme-dark')).toContainText('dark');
		await expect(page.getByTestId('theme-system')).toHaveAttribute(
			'aria-pressed',
			'true',
		);
		await expect(page.locator('html')).not.toHaveAttribute('data-theme', /.+/);
	});

	test('clicking a theme applies it and persists it across navigation', async ({
		page,
	}) => {
		await page.goto(routes.de.refs);
		await openSettings(page);

		await page.getByTestId('theme-dark').click();
		await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
		await expect(page.getByTestId('theme-dark')).toHaveAttribute(
			'aria-pressed',
			'true',
		);
		await expect(page.locator('body')).toHaveCSS(
			'background-color',
			'rgb(22, 22, 24)',
		);

		await page.getByTestId('menu-home').click();
		await expect(page).toHaveURL(new RegExp('/$'));
		await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

		await page.goto(routes.de.contact);
		await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
		await expect(page.locator('body')).toHaveCSS(
			'background-color',
			'rgb(22, 22, 24)',
		);
	});

	test('light overrides a dark system preference', async ({ page }) => {
		await page.emulateMedia({ colorScheme: 'dark' });
		await page.goto(routes.de.refs);
		await openSettings(page);

		await expect(page.locator('body')).toHaveCSS(
			'background-color',
			'rgb(22, 22, 24)',
		);

		await page.getByTestId('theme-light').click();
		await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
		await expect(page.locator('body')).toHaveCSS(
			'background-color',
			'rgb(245, 245, 247)',
		);
	});

	test('back to system follows the OS preference again', async ({ page }) => {
		await page.emulateMedia({ colorScheme: 'dark' });
		await page.goto(routes.de.refs);
		await openSettings(page);

		await page.getByTestId('theme-light').click();
		await expect(page.locator('body')).toHaveCSS(
			'background-color',
			'rgb(245, 245, 247)',
		);

		await page.getByTestId('theme-system').click();
		await expect(page.locator('html')).not.toHaveAttribute('data-theme', /.+/);
		await expect(page.locator('body')).toHaveCSS(
			'background-color',
			'rgb(22, 22, 24)',
		);
	});

	test('keyboard: ENTER on the language row switches locale in place', async ({
		page,
	}) => {
		await page.goto(routes.de.refs);
		await openSettings(page);

		await page.keyboard.press('ArrowRight');
		await page.keyboard.press('Enter');

		await expect(page).toHaveURL(new RegExp(`${routes.en.refs}/?$`));
		await expect(page.getByTestId('settings-language')).toContainText(
			'language',
		);
	});

	test('clicking english switches the whole UI and keeps the panel open', async ({
		page,
	}) => {
		await page.goto(routes.de.refs);
		await openSettings(page);

		await page.getByTestId('lang-en').click();

		await expect(page).toHaveURL(new RegExp(`${routes.en.refs}/?$`));
		await expect(page.locator('html')).toHaveAttribute('lang', 'en-US');
		await expect(page.getByTestId('menu-settings')).toContainText('settings/');
		await expect(page.getByTestId('settings-submenu')).toBeVisible();
		await expect(page.getByTestId('term-title')).toHaveText(
			'kheder — ~/settings — 80×24',
		);
		await expect(page.getByTestId('hint-line')).toHaveText(
			'↑↓ row · ←→ value · ⏎ apply · ⎋ back',
		);
	});

	test('ESC folds the panel and leaves the page where it was', async ({
		page,
	}) => {
		await page.goto(routes.de.refs);
		await openSettings(page);

		await page.keyboard.press('Escape');

		await expect(page.getByTestId('settings-submenu')).toBeHidden();
		await expect(page).toHaveURL(new RegExp(`${routes.de.refs}/?$`));
		await expect(page.getByTestId('main-menu')).toHaveCSS('opacity', '1');
		await expect(page.getByTestId('term-title')).toHaveText(
			'kheder — ~ — 80×24',
		);
	});

	test('reading on folds the panel away', async ({ page }) => {
		await page.goto(routes.de.refs);
		await openSettings(page);

		await page.getByTestId('menu-contact').click();

		await expect(page).toHaveURL(new RegExp(`${routes.de.contact}/?$`));
		await expect(page.getByTestId('settings-submenu')).toBeHidden();
	});

	test('the cursor is visible and distinct from the saved value', async ({
		page,
	}) => {
		await page.goto(routes.de.refs);
		await openSettings(page);

		const accent = 'rgb(14, 126, 138)';
		const noBorder = 'rgba(0, 0, 0, 0)';

		await expect(page.getByTestId('settings-language')).toContainText('❯');
		await expect(page.getByTestId('lang-de')).toContainText('(•) deutsch');
		await expect(page.getByTestId('lang-en')).toContainText('( ) english');
		await expect(page.getByTestId('lang-de')).toHaveCSS(
			'border-top-color',
			accent,
		);
		await expect(page.getByTestId('lang-en')).toHaveCSS(
			'border-top-color',
			noBorder,
		);

		await page.keyboard.press('ArrowDown');

		await expect(page.getByTestId('settings-theme')).toContainText('❯');
		await expect(page.getByTestId('lang-de')).toHaveCSS(
			'border-top-color',
			noBorder,
		);
		await expect(page.getByTestId('theme-system')).toHaveCSS(
			'border-top-color',
			accent,
		);

		await page.keyboard.press('ArrowRight');

		await expect(page.getByTestId('theme-light')).toHaveCSS(
			'border-top-color',
			accent,
		);
		await expect(page.getByTestId('theme-system')).toHaveCSS(
			'border-top-color',
			noBorder,
		);
		await expect(page.getByTestId('theme-system')).toContainText('(•) system');
		await expect(page.getByTestId('theme-light')).toContainText('( ) light');

		await page.keyboard.press('Enter');

		await expect(page.getByTestId('theme-light')).toContainText('(•) light');
		await expect(page.getByTestId('theme-system')).toContainText('( ) system');
	});
});
