import { expect, test } from '@playwright/test';
import { routes } from './helpers';

test.describe('self-hosted fonts', () => {
	test('no request leaves the origin for a font', async ({ page }) => {
		const external: string[] = [];
		page.on('request', (request) => {
			const host = new URL(request.url()).host;
			if (host.includes('googleapis.com') || host.includes('gstatic.com')) {
				external.push(request.url());
			}
		});

		await page.goto(routes.de.refs);
		await page.waitForLoadState('networkidle');

		expect(external).toEqual([]);
	});

	test('the display face is served from the site itself and preloaded', async ({
		page,
	}) => {
		await page.goto(routes.de.refs);

		const preload = page.locator('link[rel="preload"][as="font"]');
		await expect(preload).toHaveCount(1);
		await expect(preload).toHaveAttribute('type', 'font/woff2');
		await expect(preload).toHaveAttribute(
			'href',
			/^\/_astro\/fonts\/.*\.woff2$/,
		);

		const sources = await page.evaluate(() =>
			[...document.styleSheets]
				.flatMap((sheet) => [...sheet.cssRules])
				.filter(
					(rule): rule is CSSFontFaceRule => rule instanceof CSSFontFaceRule,
				)
				.map((rule) => rule.style.getPropertyValue('src')),
		);

		expect(sources.length).toBeGreaterThan(0);
		for (const src of sources) {
			expect(src).not.toContain('http');
		}
		expect(sources.some((src) => src.includes('/_astro/fonts/'))).toBe(true);
	});

	test('the woff2 is delivered by the origin and cached immutably', async ({
		page,
		request,
	}) => {
		await page.goto(routes.de.refs);

		const href = await page
			.locator('link[rel="preload"][as="font"]')
			.getAttribute('href');
		expect(href).toBeTruthy();

		const response = await request.get(href as string);
		expect(response.status()).toBe(200);
		expect(response.headers()['content-type']).toContain('font/woff2');
	});

	test('the wordmark renders in Montserrat, not the fallback stack', async ({
		page,
	}) => {
		await page.goto(routes.de.home);

		await expect(page.getByTestId('wordmark')).toHaveCSS(
			'font-family',
			/^Montserrat-[0-9a-f]+,/,
		);

		const loaded = await page.evaluate(async () => {
			await document.fonts.ready;
			return [...document.fonts].some(
				(face) =>
					face.family.startsWith('Montserrat') && face.status === 'loaded',
			);
		});
		expect(loaded).toBe(true);
	});
});
