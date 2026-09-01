import { expect, test } from '@playwright/test';
import { routes } from './helpers';

test.describe('content pages', () => {
	test('über mich carries the copy and the three chip groups', async ({
		page,
	}) => {
		await page.goto(routes.de.about);

		await expect(page.locator('main')).toContainText('$ whoami');
		await expect(page.locator('h1')).toHaveText('Servus, ich bin Kheder.');
		await expect(page.locator('main p').first()).toContainText(
			'Freiberuflicher Softwareentwickler aus Nürnberg mit 12 Jahren Erfahrung.',
		);
		await expect(page.locator('main strong')).toHaveText('12 Jahren Erfahrung');

		const donna = page.locator('main a', { hasText: 'DonnaDesk' });
		await expect(donna).toHaveAttribute('href', 'https://www.donnadesk.de');
		await expect(donna).toHaveAttribute('target', '_blank');

		for (const group of [
			'# Sprachen & Frameworks',
			'# Runtime & Tooling',
			'# AI & Realtime',
		]) {
			await expect(page.locator('main')).toContainText(group);
		}
		for (const chip of [
			'TypeScript',
			'C#',
			'.NET',
			'Bun',
			'Astro',
			'LiveKit',
			'Voice Agents',
		]) {
			await expect(
				page
					.locator('main span', {
						hasText: new RegExp(
							`^${chip.replace('.', '\\.').replace('#', '#')}$`,
						),
					})
					.first(),
			).toBeVisible();
		}
	});

	test('blog lists the three stubs and the note', async ({ page }) => {
		await page.goto(routes.de.blog);

		await expect(page.locator('main')).toContainText('$ ls ./blog');
		await expect(page.locator('h1')).toHaveText('Blog');
		await expect(page.locator('main li')).toHaveCount(3);
		await expect(page.locator('main')).toContainText(
			'voice-agents-mit-livekit.md',
		);
		await expect(page.locator('main')).toContainText(
			'Noch nichts veröffentlicht — die ersten Artikel sind in Arbeit.',
		);
	});

	test('an article stub shows the cat kicker and the back hint', async ({
		page,
	}) => {
		await page.goto(routes.de.post);

		await expect(page.locator('main')).toContainText(
			'$ cat ./blog/voice-agents-mit-livekit.md',
		);
		await expect(page.locator('h1')).toHaveText('Voice Agents mit LiveKit');
		await expect(page.locator('main')).toContainText(
			'Dieser Artikel ist noch in Arbeit — schau bald wieder vorbei.',
		);
		await expect(page.locator('main')).toContainText(
			'⎋ ESC — zurück zur Übersicht',
		);
	});

	test('referenzen is a plain list without cards', async ({ page }) => {
		await page.goto(routes.de.refs);

		await expect(page.locator('main')).toContainText('$ cat referenzen.md');
		await expect(page.locator('h1')).toHaveText('Referenzen');

		const entries = page.locator('main li');
		await expect(entries).toHaveCount(4);
		await expect(entries.nth(0)).toContainText('Hannover Re');
		await expect(entries.nth(0)).toContainText(
			'Enterprise-Anwendungen für einen der größten Rückversicherer der Welt.',
		);
		await expect(entries.nth(1)).toContainText('DonnaDesk');
		await expect(entries.nth(2)).toContainText('WTS');
		await expect(entries.nth(3)).toContainText('GIZ');
		await expect(entries.nth(3)).not.toHaveClass(/border-b/);
	});

	test('kontakt lists mail, github and linkedin', async ({ page }) => {
		await page.goto(routes.de.contact);

		await expect(page.locator('main')).toContainText('$ kheder --kontakt');
		await expect(page.locator('h1')).toHaveText('Sag hallo.');

		await expect(
			page.locator('main a', { hasText: 'hallo@kheder.codes' }),
		).toHaveAttribute('href', 'mailto:hallo@kheder.codes');
		await expect(
			page.locator('main a', { hasText: 'github.com/kamekaioken' }),
		).toHaveAttribute('href', 'https://github.com/kamekaioken');
		await expect(
			page.locator('main a', { hasText: 'linkedin.com/in/marlenkheder' }),
		).toHaveAttribute('href', 'https://www.linkedin.com/in/marlenkheder');
	});

	test('every content page ends with the footer', async ({ page }) => {
		for (const path of [
			routes.de.about,
			routes.de.blog,
			routes.de.refs,
			routes.de.contact,
			routes.de.settings,
		]) {
			await page.goto(path);
			const footer = page.locator('footer');
			await expect(footer).toBeVisible();
			await expect(footer.locator('img')).toBeVisible();
			await expect(footer).toContainText('exit 0');
		}
	});
});

test.describe('design tokens', () => {
	test('light theme paints the handoff colours', async ({ page }) => {
		await page.emulateMedia({ colorScheme: 'light' });
		await page.goto(routes.de.about);

		await expect(page.locator('body')).toHaveCSS(
			'background-color',
			'rgb(245, 245, 247)',
		);
		await expect(page.locator('body')).toHaveCSS('color', 'rgb(29, 29, 31)');
		await expect(page.getByTestId('term-title')).toHaveCSS(
			'color',
			'rgb(110, 110, 115)',
		);
		await expect(
			page.locator('[data-testid="menu-about"] span').first(),
		).toHaveCSS('color', 'rgb(14, 126, 138)');
	});

	test('dark theme paints the handoff colours', async ({ page }) => {
		await page.emulateMedia({ colorScheme: 'dark' });
		await page.goto(routes.de.about);

		await expect(page.locator('body')).toHaveCSS(
			'background-color',
			'rgb(22, 22, 24)',
		);
		await expect(page.locator('body')).toHaveCSS('color', 'rgb(232, 232, 234)');
		await expect(page.getByTestId('term-title')).toHaveCSS(
			'color',
			'rgb(152, 152, 157)',
		);
		await expect(
			page.locator('[data-testid="menu-about"] span').first(),
		).toHaveCSS('color', 'rgb(90, 200, 250)');
	});

	test('the terminal window is centred at 840px with the specified chrome', async ({
		page,
	}) => {
		await page.setViewportSize({ width: 1200, height: 900 });
		await page.goto(routes.de.about);

		const box = await page.getByTestId('terminal').boundingBox();
		expect(box?.width).toBe(840);

		const titlebar = page.locator('[data-testid="terminal"] .h-10').first();
		await expect(titlebar).toHaveCSS('height', '40px');
	});
});
