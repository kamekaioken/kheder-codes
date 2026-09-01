import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { routes } from './helpers';

// Cloudflare Pages applies `_headers` at the edge, so `astro preview` never
// serves these. Assert that the rules ship with the build output instead.
const headers = () => readFileSync('dist/_headers', 'utf8');

test.describe('cloudflare workers configuration', () => {
	test('security headers are published for every route', () => {
		expect(headers()).toContain('X-Content-Type-Options: nosniff');
		expect(headers()).toContain('X-Frame-Options: DENY');
		expect(headers()).toContain(
			'Referrer-Policy: strict-origin-when-cross-origin',
		);
		expect(headers()).toContain('Strict-Transport-Security: max-age=31536000');
	});

	test('fingerprinted assets are cached immutably', () => {
		expect(headers()).toMatch(
			/\/_astro\/\*\n\s+Cache-Control: public, max-age=31536000, immutable/,
		);
	});

	test('wrangler serves the astro build output as static assets', () => {
		const config = readFileSync('wrangler.toml', 'utf8');

		expect(config).toContain('name = "kheder-codes"');
		expect(config).toMatch(/\[assets\][\s\S]*directory = "\.\/dist"/);
		expect(config).toContain('html_handling = "auto-trailing-slash"');
	});

	// The about-me page became the root, so the URLs Google already knows have to
	// keep landing somewhere.
	test('the retired about-me urls redirect to the root', () => {
		const redirects = readFileSync('dist/_redirects', 'utf8');

		expect(redirects).toMatch(/^\/ueber-mich \/ 301$/m);
		expect(redirects).toMatch(/^\/en\/about \/en\/ 301$/m);
	});

	// A `main` entry point would turn every hit into a billable Worker
	// invocation; static asset requests are free and unlimited without one.
	test('no worker script is configured', () => {
		expect(readFileSync('wrangler.toml', 'utf8')).not.toMatch(/^main\s*=/m);
	});
});

test.describe('www canonicalisation', () => {
	for (const [name, path] of [
		['de', routes.de.refs],
		['en', routes.en.refs],
	] as const) {
		test(`the ${name} canonical points at the www origin`, async ({ page }) => {
			await page.goto(path);

			await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
				'href',
				/^https:\/\/www\.kheder\.codes\//,
			);
			await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
				'content',
				/^https:\/\/www\.kheder\.codes\//,
			);
		});
	}

	test('hreflang alternates use the www origin', async ({ page }) => {
		await page.goto(routes.de.refs);

		const alternates = page.locator('link[rel="alternate"]');
		expect(await alternates.count()).toBeGreaterThan(0);

		for (const href of await alternates.evaluateAll((links) =>
			links.map((link) => link.getAttribute('href')),
		)) {
			expect(href).toMatch(/^https:\/\/www\.kheder\.codes\//);
		}
	});
});
