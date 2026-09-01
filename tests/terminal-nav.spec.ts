import { expect, test } from '@playwright/test';
import {
	openTerminalFromHero,
	routes,
	selectedRows,
	waitForMenu,
} from './helpers';

const menuCopy = [
	['menu-home', '~', 'Wer ich bin & womit ich arbeite'],
	['menu-blog', 'blog/', 'Notizen & Artikel'],
	['menu-refs', 'referenzen', 'Projekte & Kunden'],
	['menu-contact', 'kontakt', 'Sag hallo'],
	['menu-donna', 'donnadesk ↗', 'Mein Startup — öffnet donnadesk.de'],
	['menu-settings', 'einstellungen/', 'Sprache & Theme'],
	['menu-legal', 'rechtliches/', 'Impressum & Datenschutz'],
] as const;

test.describe('terminal as navigation', () => {
	test('shows the seven menu options in order with the exact copy', async ({
		page,
	}) => {
		await page.goto(routes.de.refs);
		await waitForMenu(page);

		const rows = page.locator('[data-testid^="menu-"]');
		await expect(rows).toHaveCount(menuCopy.length);

		for (const [index, [testId, name, description]] of menuCopy.entries()) {
			const row = page.getByTestId(testId);
			await expect(rows.nth(index)).toHaveAttribute('data-testid', testId);
			await expect(row).toContainText(name);
			await expect(row).toContainText(description);
		}

		await expect(page.getByTestId('hint-line')).toHaveText(
			'↑↓ wählen · ⏎ öffnen · [1–7] direkt · ⎋ zurück · oder klicken',
		);
	});

	test('marks the current page as selected', async ({ page }) => {
		await page.goto(routes.de.refs);
		await waitForMenu(page);

		await expect(page.getByTestId('menu-refs')).toHaveAttribute(
			'aria-current',
			'page',
		);
		await expect(selectedRows(page)).toHaveCount(1);
		await expect(page.getByTestId('menu-refs')).toHaveClass(/row-selected/);
	});

	test('arrow keys move the selection and ENTER opens the row', async ({
		page,
	}) => {
		await page.goto('/');
		await openTerminalFromHero(page);

		await expect(page.getByTestId('menu-home')).toHaveClass(/row-selected/);

		await page.keyboard.press('ArrowDown');
		await page.keyboard.press('ArrowDown');
		await expect(page.getByTestId('menu-refs')).toHaveClass(/row-selected/);

		await page.keyboard.press('Enter');
		await expect(page).toHaveURL(new RegExp(`${routes.de.refs}/?$`));
		await expect(page.locator('h1')).toHaveText('Referenzen');
	});

	test('arrow keys wrap around the menu', async ({ page }) => {
		await page.goto('/');
		await openTerminalFromHero(page);

		await page.keyboard.press('ArrowUp');
		await expect(page.getByTestId('menu-legal')).toHaveClass(/row-selected/);
	});

	test('number keys open a row directly', async ({ page }) => {
		await page.goto('/');
		await openTerminalFromHero(page);

		await page.keyboard.press('4');
		await expect(page).toHaveURL(new RegExp(`${routes.de.contact}/?$`));
		await expect(page.locator('h1')).toHaveText('Sag hallo.');
	});

	test('clicking a row navigates', async ({ page }) => {
		await page.goto('/');
		await openTerminalFromHero(page);

		await page.getByTestId('menu-blog').click();
		await expect(page).toHaveURL(new RegExp(`${routes.de.blog}/?$`));
		await expect(page.locator('h1')).toHaveText('Blog');
	});

	test('donnadesk is an external link in a new tab', async ({ page }) => {
		await page.goto(routes.de.refs);
		await waitForMenu(page);

		const donna = page.getByTestId('menu-donna');
		await expect(donna).toHaveAttribute('href', 'https://www.donnadesk.de');
		await expect(donna).toHaveAttribute('target', '_blank');
		await expect(donna).toHaveAttribute('rel', /noopener/);
	});

	test('the terminal keeps its typed state across navigation', async ({
		page,
	}) => {
		await page.goto('/');
		await openTerminalFromHero(page);

		await page.getByTestId('menu-refs').click();
		await expect(page).toHaveURL(new RegExp(`${routes.de.refs}/?$`));

		await expect(page.getByTestId('terminal')).toBeVisible();
		await expect(page.getByTestId('menu-settings')).toHaveCSS('opacity', '1');
	});
});

test.describe('blog submenu', () => {
	test('opens inside the terminal and dims the main menu', async ({ page }) => {
		await page.goto(routes.de.blog);
		await waitForMenu(page);

		await expect(page.getByTestId('blog-submenu')).toBeVisible();
		await expect(page.getByTestId('main-menu')).toHaveCSS('opacity', '0.4');
		await expect(page.getByTestId('term-title')).toHaveText(
			'kheder — ~/blog — 80×24',
		);
		await expect(page.getByTestId('blog-submenu')).toContainText('kheder blog');
		await expect(page.getByTestId('blog-submenu')).toContainText(
			'3 Einträge — alle noch in Arbeit:',
		);
		await expect(page.getByTestId('hint-line')).toHaveText(
			'↑↓ wählen · ⏎ öffnen · [1–3] direkt · ⎋ zurück',
		);
	});

	test('lists the three entries with a work-in-progress badge', async ({
		page,
	}) => {
		await page.goto(routes.de.blog);
		await waitForMenu(page);

		const entries = [
			'voice-agents-mit-livekit.md',
			'monorepos-ohne-kopfschmerzen.md',
			'astro-fuer-freelancer.md',
		];

		for (const [index, file] of entries.entries()) {
			const row = page.getByTestId(`post-${index + 1}`);
			await expect(row).toContainText(file);
			await expect(row).toContainText('in Arbeit');
		}
	});

	test('arrow keys and ENTER open an article stub', async ({ page }) => {
		await page.goto(routes.de.blog);
		await waitForMenu(page);

		await page.keyboard.press('ArrowDown');
		await page.keyboard.press('Enter');

		await expect(page).toHaveURL(
			new RegExp('/blog/monorepos-ohne-kopfschmerzen/?$'),
		);
		await expect(page.locator('h1')).toHaveText('Monorepos ohne Kopfschmerzen');
	});

	test('number keys open an article directly', async ({ page }) => {
		await page.goto(routes.de.blog);
		await waitForMenu(page);

		await page.keyboard.press('3');
		await expect(page).toHaveURL(new RegExp('/blog/astro-fuer-freelancer/?$'));
	});
});

test.describe('ESC goes back hierarchically', () => {
	test('article → blog list → main menu → intro', async ({ page }) => {
		await page.goto(routes.de.post);
		await waitForMenu(page);

		await page.keyboard.press('Escape');
		await expect(page).toHaveURL(new RegExp(`${routes.de.blog}/?$`));

		await page.keyboard.press('Escape');
		await expect(page).toHaveURL(new RegExp('/$'));
		await expect(page.locator('html')).toHaveAttribute('data-phase', 'term');

		await page.keyboard.press('Escape');
		await expect(page.locator('html')).toHaveAttribute('data-phase', 'hero');
		await expect(page.getByTestId('hero')).toBeVisible();
	});

	test('a content page goes straight back to the main menu', async ({
		page,
	}) => {
		await page.goto(routes.de.contact);
		await waitForMenu(page);

		await page.keyboard.press('Escape');
		await expect(page).toHaveURL(new RegExp('/$'));
		await expect(page.getByTestId('main-menu')).toHaveCSS('opacity', '1');
	});
});
