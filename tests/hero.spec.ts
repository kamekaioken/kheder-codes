import { expect, test } from '@playwright/test';
import { openTerminalFromHero, routes, waitForMenu } from './helpers';

test.describe('hero intro', () => {
	test('types the wordmark and then offers the ENTER hint', async ({
		page,
	}) => {
		await page.goto('/');

		const hero = page.getByTestId('hero');
		await expect(hero).toBeVisible();
		await expect(page.getByTestId('terminal')).toBeHidden();

		await expect(page.getByTestId('wordmark')).toHaveText(/KHEDER\s*\.codes/);
		await expect(page.getByTestId('hero-enter')).toBeVisible();
		await expect(page.getByTestId('hero-enter')).toContainText('⏎ ENTER');
		await expect(page.getByTestId('hero-enter')).toContainText(
			'drücken — oder klicken / scrollen',
		);
	});

	test('ENTER opens the terminal and reveals the menu', async ({ page }) => {
		await page.goto('/');
		await openTerminalFromHero(page);

		await expect(page.getByTestId('hero')).toBeHidden();
		await expect(page.getByTestId('term-title')).toHaveText(
			'kheder — ~ — 80×24',
		);
		await expect(page.getByTestId('main-menu')).toContainText(
			'kheder v12.0 — freiberuflicher softwareentwickler',
		);
		await expect(page.getByTestId('main-menu')).toContainText(
			'wähle eine option:',
		);
	});

	test('a click anywhere in the hero opens the terminal', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByTestId('hero')).toBeVisible();

		await page.getByTestId('hero').click({ position: { x: 20, y: 20 } });
		await expect(page.locator('html')).toHaveAttribute('data-phase', 'term');
	});

	test('scrolling opens the terminal', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByTestId('hero')).toBeVisible();

		await page.mouse.wheel(0, 200);
		await expect(page.locator('html')).toHaveAttribute('data-phase', 'term');
	});

	test('the intro is skipped on a second visit within the session', async ({
		page,
	}) => {
		await page.goto('/');
		await openTerminalFromHero(page);

		await page.reload();

		await expect(page.locator('html')).toHaveAttribute('data-phase', 'term');
		await expect(page.getByTestId('hero')).toBeHidden();
		await waitForMenu(page);
	});

	test('the red traffic light closes the window and replays the intro', async ({
		page,
	}) => {
		await page.goto('/');
		await openTerminalFromHero(page);

		await page.getByRole('button', { name: 'Schließen (⎋)' }).click();

		await expect(page.locator('html')).toHaveAttribute('data-phase', 'hero');
		await expect(page.getByTestId('hero')).toBeVisible();
		await expect(page.getByTestId('terminal')).toBeHidden();
	});

	test('the red traffic light on a subpage returns home and replays the intro', async ({
		page,
	}) => {
		await page.goto(routes.de.contact);
		await waitForMenu(page);

		await page.getByRole('button', { name: 'Schließen (⎋)' }).click();

		await expect(page).toHaveURL(new RegExp('/$'));
		await expect(page.locator('html')).toHaveAttribute('data-phase', 'hero');
		await expect(page.getByTestId('hero')).toBeVisible();
		await expect(page.locator('footer')).toBeHidden();
	});

	test('the footer stays hidden during the intro and appears with the terminal', async ({
		page,
	}) => {
		await page.goto('/');
		const footer = page.locator('footer');
		await expect(footer).toBeHidden();

		await openTerminalFromHero(page);
		await expect(footer).toBeVisible();
		await expect(footer).toContainText('© 2026 kheder.codes');
		await expect(footer).toContainText('exit 0');
	});
});
