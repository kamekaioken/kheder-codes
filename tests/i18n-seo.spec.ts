import { expect, test } from '@playwright/test';
import { openTerminalFromHero, routes } from './helpers';

const pairs = [
	['home', routes.de.home, routes.en.home],
	['team', routes.de.team, routes.en.team],
	['member', routes.de.member, routes.en.member],
	['blog', routes.de.blog, routes.en.blog],
	['refs', routes.de.refs, routes.en.refs],
	['contact', routes.de.contact, routes.en.contact],
] as const;

test.describe('internationalisation', () => {
	test('german is served without a prefix, english under /en', async ({
		page,
	}) => {
		await page.goto(routes.de.home);
		await expect(page.locator('html')).toHaveAttribute('lang', 'de-DE');
		await expect(page.locator('h1')).toHaveText(
			'Servus, wir sind KHEDER.codes.',
		);

		await page.goto(routes.en.home);
		await expect(page.locator('html')).toHaveAttribute('lang', 'en-US');
		await expect(page.locator('h1')).toHaveText("Hi, we're KHEDER.codes.");
	});

	test('english routes use translated slugs', async ({ page }) => {
		for (const [, , enPath] of pairs) {
			const response = await page.goto(enPath);
			expect(response?.status(), enPath).toBe(200);
		}
	});

	test('the english terminal menu is translated', async ({ page }) => {
		await page.goto(routes.en.refs);

		await expect(page.getByTestId('menu-home')).toContainText('Home');
		await expect(page.getByTestId('menu-team')).toContainText('Who we are');
		await expect(page.getByTestId('menu-refs')).toContainText('references');
		await expect(page.getByTestId('menu-contact')).toContainText('contact');
		await expect(page.getByTestId('menu-settings')).toContainText('settings/');
		await expect(page.getByTestId('menu-legal')).toContainText('legal/');
		await expect(page.getByTestId('hint-line')).toHaveText(
			'↑↓ select · ⏎ open · [1–8] direct · ⎋ back · or click',
		);
	});

	test('english menu links point at english routes', async ({ page }) => {
		await page.goto(routes.en.refs);

		await expect(page.getByTestId('menu-home')).toHaveAttribute(
			'href',
			routes.en.home,
		);
		await expect(page.getByTestId('menu-team')).toHaveAttribute(
			'href',
			routes.en.team,
		);
		await expect(page.getByTestId('menu-refs')).toHaveAttribute(
			'href',
			routes.en.refs,
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

	test('the english team profiles are translated', async ({ page }) => {
		await page.goto(routes.en.member);

		await expect(page.locator('h1')).toHaveText('Marlen Kheder');
		await expect(page.getByTestId('member-role')).toHaveText(
			'Senior Developer & Software Architect',
		);
		await expect(page.locator('main h2').first()).toHaveText('What I work on');
		await expect(page.getByTestId('doc-next')).toHaveAttribute(
			'href',
			'/en/team/alan-kerkuki',
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
		[routes.de.home, 'kheder.codes — Softwareentwicklung aus Nürnberg'],
		[routes.de.team, 'Team — kheder.codes'],
		[routes.de.member, 'Marlen Kheder — kheder.codes'],
		[routes.de.blog, 'Blog — kheder.codes'],
		[routes.de.refs, 'Referenzen — kheder.codes'],
		[routes.de.contact, 'Kontakt — kheder.codes'],
		[routes.de.post, 'Voice Agents mit LiveKit — kheder.codes'],
		[routes.en.home, 'kheder.codes — software development from Nuremberg'],
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

	// The outline belongs to the page column: the terminal beside it carries the
	// menu, and not a single heading.
	test('every page has exactly one h1, in the content and never in the terminal', async ({
		page,
	}) => {
		const headings = [
			[routes.de.team, 'Team'],
			[routes.de.member, 'Marlen Kheder'],
			[routes.de.blog, 'Blog'],
			[routes.de.refs, 'Referenzen'],
			[routes.de.contact, 'Sag hallo.'],
			[routes.de.post, 'Voice Agents mit LiveKit'],
		] as const;

		for (const [path, heading] of headings) {
			await page.goto(path);

			await expect(page.locator('h1'), path).toHaveCount(1);
			await expect(page.locator('h1'), path).toHaveText(heading);
			await expect(page.locator('h1'), path).toBeVisible();
			await expect(page.locator('main h1'), path).toHaveCount(1);
			await expect(
				page.locator('[data-testid="terminal"] :is(h1,h2,h3,h4,h5,h6)'),
				path,
			).toHaveCount(0);
		}
	});

	test('the home page heading is its own copy, the wordmark is decoration', async ({
		page,
	}) => {
		await page.goto(routes.de.home);
		await openTerminalFromHero(page);

		await expect(page.locator('h1')).toHaveCount(1);
		await expect(page.locator('h1')).toHaveText(
			'Servus, wir sind KHEDER.codes.',
		);
		await expect(page.locator('main h1')).toHaveCount(1);
		await expect(page.getByTestId('wordmark')).toHaveText(/KHEDER\s*\.codes/);
		await expect(page.getByTestId('wordmark')).toHaveJSProperty('tagName', 'P');
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
		expect(xml).toContain('https://www.kheder.codes/team');
		expect(xml).toContain('https://www.kheder.codes/team/marlen-kheder');
		expect(xml).not.toContain('/einstellungen');
	});
});
