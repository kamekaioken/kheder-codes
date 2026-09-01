import { expect, test } from '@playwright/test';
import { openTerminalFromHero, routes } from './helpers';

const pairs = [
	['home', routes.de.home, routes.en.home],
	['blog', routes.de.blog, routes.en.blog],
	['refs', routes.de.refs, routes.en.refs],
	['contact', routes.de.contact, routes.en.contact],
	['settings', routes.de.settings, routes.en.settings],
] as const;

test.describe('internationalisation', () => {
	test('german is served without a prefix, english under /en', async ({
		page,
	}) => {
		await page.goto(routes.de.home);
		await expect(page.locator('html')).toHaveAttribute('lang', 'de-DE');
		await expect(page.locator('h1')).toHaveText('Servus, ich bin Kheder.');

		await page.goto(routes.en.home);
		await expect(page.locator('html')).toHaveAttribute('lang', 'en-US');
		await expect(page.locator('h1')).toHaveText("Hi, I'm Kheder.");
	});

	test('english routes use translated slugs', async ({ page }) => {
		for (const [, , enPath] of pairs) {
			const response = await page.goto(enPath);
			expect(response?.status(), enPath).toBe(200);
		}
	});

	test('the english terminal menu is translated', async ({ page }) => {
		await page.goto(routes.en.refs);

		await expect(page.getByTestId('menu-home')).toContainText(
			'Who I am & what I work with',
		);
		await expect(page.getByTestId('menu-refs')).toContainText('references');
		await expect(page.getByTestId('menu-contact')).toContainText('contact');
		await expect(page.getByTestId('menu-settings')).toContainText('settings/');
		await expect(page.getByTestId('menu-legal')).toContainText('legal/');
		await expect(page.getByTestId('hint-line')).toHaveText(
			'↑↓ select · ⏎ open · [1–7] direct · ⎋ back · or click',
		);
	});

	test('english menu links point at english routes', async ({ page }) => {
		await page.goto(routes.en.refs);

		await expect(page.getByTestId('menu-home')).toHaveAttribute(
			'href',
			routes.en.home,
		);
		await expect(page.getByTestId('menu-refs')).toHaveAttribute(
			'href',
			routes.en.refs,
		);
		await expect(page.getByTestId('menu-settings')).toHaveAttribute(
			'href',
			routes.en.settings,
		);
	});

	test('english blog entries use english filenames', async ({ page }) => {
		await page.goto(routes.en.blog);

		await expect(page.getByTestId('blog-submenu')).toContainText(
			'voice-agents-with-livekit.md',
		);
		await expect(page.getByTestId('blog-submenu')).toContainText('in progress');
		await expect(page.locator('main')).toContainText(
			'Nothing published yet — the first articles are in progress.',
		);
	});

	test('each page links its counterpart with hreflang', async ({ page }) => {
		for (const [name, dePath, enPath] of pairs) {
			await page.goto(dePath);

			await expect(
				page.locator('link[rel="alternate"][hreflang="de-DE"]'),
				name,
			).toHaveAttribute('href', new RegExp(`${dePath.replace(/\/$/, '')}/?$`));
			await expect(
				page.locator('link[rel="alternate"][hreflang="en-US"]'),
				name,
			).toHaveAttribute('href', new RegExp(`${enPath.replace(/\/$/, '')}/?$`));
			await expect(
				page.locator('link[rel="alternate"][hreflang="x-default"]'),
			).toHaveCount(1);
		}
	});

	test('blog articles link their translation', async ({ page }) => {
		await page.goto(routes.de.post);

		await expect(
			page.locator('link[rel="alternate"][hreflang="en-US"]'),
		).toHaveAttribute('href', /\/en\/blog\/voice-agents-with-livekit\/?$/);
	});
});

test.describe('SEO basics', () => {
	const expected = [
		[routes.de.home, 'kheder.codes — freiberuflicher Softwareentwickler'],
		[routes.de.blog, 'Blog — kheder.codes'],
		[routes.de.refs, 'Referenzen — kheder.codes'],
		[routes.de.contact, 'Kontakt — kheder.codes'],
		[routes.de.settings, 'Einstellungen — kheder.codes'],
		[routes.de.post, 'Voice Agents mit LiveKit — kheder.codes'],
		[routes.en.home, 'kheder.codes — freelance software developer'],
	] as const;

	for (const [path, title] of expected) {
		test(`${path} has its own title, description and canonical`, async ({
			page,
		}) => {
			await page.goto(path);

			await expect(page).toHaveTitle(title);
			await expect(page.locator('meta[name="description"]')).toHaveAttribute(
				'content',
				/.{40,}/,
			);
			await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
				'href',
				new RegExp(
					`^https://www\\.kheder\\.codes${path.replace(/\/$/, '')}/?$`,
				),
			);
			await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
				'content',
				title,
			);
		});
	}

	test('every page has exactly one h1 and it is the visible heading', async ({
		page,
	}) => {
		const headings = [
			[routes.de.blog, 'Blog'],
			[routes.de.refs, 'Referenzen'],
			[routes.de.contact, 'Sag hallo.'],
			[routes.de.settings, 'Einstellungen'],
			[routes.de.post, 'Voice Agents mit LiveKit'],
		] as const;

		for (const [path, heading] of headings) {
			await page.goto(path);

			await expect(page.locator('h1'), path).toHaveCount(1);
			await expect(page.locator('h1'), path).toHaveText(heading);
			await expect(page.locator('h1'), path).toBeVisible();
		}
	});

	test('the home page heading is its own copy, the wordmark is decoration', async ({
		page,
	}) => {
		await page.goto(routes.de.home);
		await openTerminalFromHero(page);

		await expect(page.locator('h1')).toHaveCount(1);
		await expect(page.locator('h1')).toHaveText('Servus, ich bin Kheder.');
		await expect(page.locator('h1')).toBeVisible();
		await expect(page.getByTestId('wordmark')).toHaveText(/KHEDER\s*\.codes/);
	});

	test('sitemap and robots are published', async ({ request }) => {
		const robots = await request.get('/robots.txt');
		expect(robots.status()).toBe(200);
		expect(await robots.text()).toContain(
			'Sitemap: https://www.kheder.codes/sitemap-index.xml',
		);

		const sitemap = await request.get('/sitemap-0.xml');
		expect(sitemap.status()).toBe(200);
		const xml = await sitemap.text();
		expect(xml).toContain('https://www.kheder.codes/referenzen');
		expect(xml).toContain('https://www.kheder.codes/en/references');
		expect(xml).not.toContain('/ueber-mich');
	});
});
