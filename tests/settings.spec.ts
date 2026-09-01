import { expect, test } from '@playwright/test';
import { routes, waitForMenu } from './helpers';

test.describe('settings submenu', () => {
	test('opens inside the terminal with a language and a theme row', async ({
		page,
	}) => {
		await page.goto(routes.de.settings);
		await waitForMenu(page);

		await expect(page.getByTestId('settings-submenu')).toBeVisible();
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

	test('offers deutsch/english and marks the active language', async ({
		page,
	}) => {
		await page.goto(routes.de.settings);
		await waitForMenu(page);

		await expect(page.getByTestId('lang-de')).toHaveText('deutsch');
		await expect(page.getByTestId('lang-en')).toHaveText('english');
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
			routes.en.settings,
		);
	});

	test('offers system/light/dark with system active by default', async ({
		page,
	}) => {
		await page.goto(routes.de.settings);
		await waitForMenu(page);

		await expect(page.getByTestId('theme-system')).toHaveText('system');
		await expect(page.getByTestId('theme-light')).toHaveText('light');
		await expect(page.getByTestId('theme-dark')).toHaveText('dark');
		await expect(page.getByTestId('theme-system')).toHaveAttribute(
			'aria-pressed',
			'true',
		);
		await expect(page.locator('html')).not.toHaveAttribute('data-theme', /.+/);
	});

	test('clicking a theme applies it and persists it across navigation', async ({
		page,
	}) => {
		await page.goto(routes.de.settings);
		await waitForMenu(page);

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

		await page.getByTestId('menu-about').click();
		await expect(page).toHaveURL(new RegExp(`${routes.de.about}/?$`));
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
		await page.goto(routes.de.settings);
		await waitForMenu(page);

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
		await page.goto(routes.de.settings);
		await waitForMenu(page);

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

	test('keyboard: down to the theme row, right, then ENTER applies', async ({
		page,
	}) => {
		await page.goto(routes.de.settings);
		await waitForMenu(page);

		await page.keyboard.press('ArrowDown');
		await page.keyboard.press('ArrowRight');
		await page.keyboard.press('Enter');

		await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
	});

	test('keyboard: ENTER on the language row switches locale', async ({
		page,
	}) => {
		await page.goto(routes.de.settings);
		await waitForMenu(page);

		await page.keyboard.press('ArrowRight');
		await page.keyboard.press('Enter');

		await expect(page).toHaveURL(new RegExp(`${routes.en.settings}/?$`));
		await expect(page.getByTestId('settings-language')).toContainText(
			'language',
		);
	});

	test('clicking english switches the whole UI', async ({ page }) => {
		await page.goto(routes.de.settings);
		await waitForMenu(page);

		await page.getByTestId('lang-en').click();

		await expect(page).toHaveURL(new RegExp(`${routes.en.settings}/?$`));
		await expect(page.locator('html')).toHaveAttribute('lang', 'en-US');
		await expect(page.getByTestId('menu-settings')).toContainText('settings/');
		await expect(page.getByTestId('term-title')).toHaveText(
			'kheder — ~/settings — 80×24',
		);
		await expect(page.getByTestId('hint-line')).toHaveText(
			'↑↓ row · ←→ value · ⏎ apply · ⎋ back',
		);
	});

	test('ESC leaves the settings submenu', async ({ page }) => {
		await page.goto(routes.de.settings);
		await waitForMenu(page);

		await page.keyboard.press('Escape');
		await expect(page).toHaveURL(new RegExp('/$'));
		await expect(page.getByTestId('settings-submenu')).toBeHidden();
	});

	test('the settings page carries crawlable content', async ({ page }) => {
		await page.goto(routes.de.settings);

		await expect(page).toHaveTitle('Einstellungen — kheder.codes');
		await expect(page.locator('h2')).toHaveText('Einstellungen');
		await expect(page.locator('main')).toContainText(
			'lokal in diesem Browser gespeichert',
		);
	});
});
