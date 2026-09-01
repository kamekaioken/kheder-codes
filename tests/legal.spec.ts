import { expect, type Page, test } from '@playwright/test';
import { routes, waitForMenu } from './helpers';

test.describe('legal submenu', () => {
	test('sits last in the main menu and opens inside the terminal', async ({
		page,
	}) => {
		await page.goto(routes.de.legal);
		await waitForMenu(page);

		const rows = page.locator('[data-testid^="menu-"]');
		await expect(rows).toHaveCount(7);
		await expect(rows.nth(6)).toHaveAttribute('data-testid', 'menu-legal');

		await expect(page.getByTestId('legal-submenu')).toBeVisible();
		await expect(page.getByTestId('main-menu')).toHaveCSS('opacity', '0.4');
		await expect(page.getByTestId('term-title')).toHaveText(
			'kheder — ~/rechtliches — 80×24',
		);
		await expect(page.getByTestId('legal-submenu')).toContainText(
			'kheder rechtliches',
		);
		await expect(page.getByTestId('legal-submenu')).toContainText(
			'2 Dokumente:',
		);
		await expect(page.getByTestId('hint-line')).toHaveText(
			'↑↓ wählen · ⏎ öffnen · [1–2] direkt · ⎋ zurück',
		);
	});

	test('lists impressum and datenschutz in that order', async ({ page }) => {
		await page.goto(routes.de.legal);
		await waitForMenu(page);

		const entries = page.locator('[data-testid="legal-submenu"] nav a');
		await expect(entries).toHaveCount(2);
		await expect(page.getByTestId('legal-imprint')).toContainText(
			'impressum.md',
		);
		await expect(page.getByTestId('legal-imprint')).toHaveAttribute(
			'href',
			routes.de.imprint,
		);
		await expect(page.getByTestId('legal-privacy')).toContainText(
			'datenschutz.md',
		);
		await expect(page.getByTestId('legal-privacy')).toHaveAttribute(
			'href',
			routes.de.privacy,
		);
	});

	test('arrow keys and ENTER open a document', async ({ page }) => {
		await page.goto(routes.de.legal);
		await waitForMenu(page);

		await page.keyboard.press('ArrowDown');
		await page.keyboard.press('Enter');

		await expect(page).toHaveURL(new RegExp(`${routes.de.privacy}/?$`));
		await expect(page.locator('h1')).toHaveText('Datenschutzerklärung');
	});

	test('number keys open a document directly', async ({ page }) => {
		await page.goto(routes.de.legal);
		await waitForMenu(page);

		await page.keyboard.press('1');
		await expect(page).toHaveURL(new RegExp(`${routes.de.imprint}/?$`));
		await expect(page.locator('h1')).toHaveText('Impressum');
	});

	test('a document marks its own row and the legal row of the main menu', async ({
		page,
	}) => {
		await page.goto(routes.de.privacy);
		await waitForMenu(page);

		await expect(page.getByTestId('menu-legal')).toHaveAttribute(
			'aria-current',
			'page',
		);
		await expect(page.getByTestId('legal-privacy')).toHaveAttribute(
			'aria-current',
			'page',
		);
		await expect(page.getByTestId('legal-privacy')).toHaveClass(/row-selected/);
	});

	test('ESC steps document → legal list → main menu', async ({ page }) => {
		await page.goto(routes.de.imprint);
		await waitForMenu(page);

		await page.keyboard.press('Escape');
		await expect(page).toHaveURL(new RegExp(`${routes.de.legal}/?$`));

		await page.keyboard.press('Escape');
		await expect(page).toHaveURL(new RegExp('/$'));
		await expect(page.getByTestId('main-menu')).toHaveCSS('opacity', '1');
	});

	test('the english menu links the same german documents', async ({ page }) => {
		await page.goto(routes.en.about);
		await waitForMenu(page);

		await expect(page.getByTestId('menu-legal')).toHaveAttribute(
			'href',
			routes.de.legal,
		);
		await expect(page.getByTestId('menu-legal')).toContainText(
			'Impressum & Datenschutz — in German',
		);
	});
});

test.describe('legal pages', () => {
	test('the overview lists both documents', async ({ page }) => {
		await page.goto(routes.de.legal);

		await expect(page.locator('main')).toContainText('$ ls ./rechtliches');
		await expect(page.locator('h1')).toHaveText('Rechtliches');

		const entries = page.locator('main li');
		await expect(entries).toHaveCount(2);
		await expect(entries.nth(0)).toContainText('impressum.md');
		await expect(entries.nth(1)).toContainText('datenschutz.md');
		await expect(page.locator('main')).toContainText(
			'Beide Dokumente sind rechtsverbindlich nur in deutscher Sprache.',
		);
	});

	test('the impressum carries every § 5 DDG mandatory detail', async ({
		page,
	}) => {
		await page.goto(routes.de.imprint);

		await expect(page.locator('h1')).toHaveText('Impressum');
		await expect(page.getByTestId('legal-updated')).toHaveText(
			'Stand: 1. September 2026',
		);

		const main = page.locator('main');
		await expect(main).toContainText('Angaben gemäß § 5 DDG');
		await expect(main).toContainText('Marlen Kheder');
		await expect(main).toContainText('c/o DonnaDesk GmbH');
		await expect(main).toContainText('Kleestraße 21 – 23');
		await expect(main).toContainText('90461 Nürnberg');
		await expect(main).toContainText('DE322286907');
		await expect(main).toContainText(
			'Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV',
		);

		await expect(
			main.locator('a', { hasText: 'hallo@kheder.codes' }),
		).toHaveAttribute('href', 'mailto:hallo@kheder.codes');
	});

	test('the impressum explains the DonnaDesk letterbox', async ({ page }) => {
		await page.goto(routes.de.imprint);

		await expect(page.locator('main')).toContainText(
			'Der Briefkasten unter dieser Anschrift ist mit „DonnaDesk GmbH“ beschriftet.',
		);
		await expect(page.locator('main')).toContainText(
			'Dieses Angebot wird von Marlen Kheder als natürlicher Person betrieben, nicht von der DonnaDesk GmbH.',
		);
	});

	// The mirrored donnadesk.de policy was trimmed to what this site actually does.
	test('the privacy policy keeps the sections that apply here', async ({
		page,
	}) => {
		await page.goto(routes.de.privacy);

		await expect(page.locator('h1')).toHaveText('Datenschutzerklärung');

		for (const heading of [
			'1. Verantwortlicher',
			'4. Ihre Rechte als betroffene Person',
			'5. Aufruf der Website, Server-Logfiles, Hosting und CDN',
			'6. Cookies',
			'7. Lokale Speicherung im Browser',
			'8. Webanalyse mit Plausible Analytics',
			'10. Schriftarten',
			'14. Keine automatisierte Entscheidungsfindung',
		]) {
			await expect(page.locator('main h2', { hasText: heading })).toHaveCount(
				1,
			);
		}

		await expect(page.locator('main')).toContainText(
			'Bayerisches Landesamt für Datenschutzaufsicht',
		);
		await expect(page.locator('main')).toContainText('Cloudflare, Inc.');
	});

	test('the privacy policy drops what this site does not use', async ({
		page,
	}) => {
		await page.goto(routes.de.privacy);
		const body = (await page.locator('main').textContent()) ?? '';

		for (const dropped of [
			'heyData',
			'Hetzner',
			'rapidmail',
			'Google Workspace',
			'Geschäftsführer',
			'api.donnadesk.de',
		]) {
			expect(body, dropped).not.toContain(dropped);
		}

		expect(body).toContain('Diese Website enthält kein Kontaktformular.');
		expect(body).toContain('Ein Datenschutzbeauftragter ist nicht bestellt');
	});

	test('the controller is the person, not the GmbH', async ({ page }) => {
		await page.goto(routes.de.privacy);
		const body = (await page.locator('main').textContent()) ?? '';

		expect(body).toContain('Marlen Kheder');
		// DonnaDesk GmbH may only appear as the letterbox in the postal address.
		const mentions = body.match(/DonnaDesk GmbH/g) ?? [];
		const asAddress = body.match(/c\/o DonnaDesk GmbH/g) ?? [];
		expect(mentions).toHaveLength(asAddress.length);
		expect(asAddress.length).toBeGreaterThan(0);
	});

	test('the privacy policy names the browser storage the terminal uses', async ({
		page,
	}) => {
		await page.goto(routes.de.privacy);

		await expect(page.locator('main')).toContainText('kheder:theme');
		await expect(page.locator('main')).toContainText('kheder:intro-seen');
		await expect(page.locator('main')).toContainText('§ 25 Abs. 2 Nr. 2 TDDDG');
	});

	test('the fonts section matches how fonts are actually loaded', async ({
		page,
	}) => {
		await page.goto(routes.de.privacy);

		await expect(page.locator('main')).toContainText(
			'binde ich diese lokal von meinem eigenen Server ein',
		);
	});

	test('both documents are reachable from the footer on every page', async ({
		page,
	}) => {
		for (const path of [routes.de.about, routes.en.about, routes.de.blog]) {
			await page.goto(path);

			const legal = page.getByTestId('footer-legal');
			await expect(legal.locator('a'), path).toHaveCount(2);
			await expect(legal.locator('a').nth(0)).toHaveAttribute(
				'href',
				routes.de.imprint,
			);
			await expect(legal.locator('a').nth(1)).toHaveAttribute(
				'href',
				routes.de.privacy,
			);
		}
	});
});

test.describe('legal SEO', () => {
	const pages = [
		[routes.de.legal, 'Rechtliches — kheder.codes'],
		[routes.de.imprint, 'Impressum — kheder.codes'],
		[routes.de.privacy, 'Datenschutzerklärung — kheder.codes'],
	] as const;

	for (const [path, title] of pages) {
		test(`${path} has its own title and canonical`, async ({ page }) => {
			await page.goto(path);

			await expect(page).toHaveTitle(title);
			await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
				'href',
				new RegExp(`^https://www\\.kheder\\.codes${path}/?$`),
			);
			await expect(page.locator('h1')).toHaveCount(1);
		});
	}

	test('german only: no english alternate is advertised', async ({ page }) => {
		for (const [path] of pages) {
			await page.goto(path);

			await expect(
				page.locator('link[rel="alternate"][hreflang="de-DE"]'),
				path,
			).toHaveCount(1);
			await expect(
				page.locator('link[rel="alternate"][hreflang="en-US"]'),
				path,
			).toHaveCount(0);
			await expect(page.locator('html'), path).toHaveAttribute('lang', 'de-DE');
		}
	});

	test('the documents are in the sitemap', async ({ request }) => {
		const xml = await (await request.get('/sitemap-0.xml')).text();

		expect(xml).toContain('https://www.kheder.codes/impressum');
		expect(xml).toContain('https://www.kheder.codes/datenschutz');
	});
});

test.describe('legal pages without JavaScript', () => {
	test.use({ javaScriptEnabled: false });

	const clickOptions = { force: true } as const;

	test('the menu row and the submenu rows are plain links', async ({
		page,
	}) => {
		await page.goto(routes.de.about);

		await page.getByTestId('menu-legal').click(clickOptions);
		await expect(page).toHaveURL(new RegExp(`${routes.de.legal}/?$`));

		await page.getByTestId('legal-privacy').click(clickOptions);
		await expect(page).toHaveURL(new RegExp(`${routes.de.privacy}/?$`));
		await expect(page.locator('h1')).toHaveText('Datenschutzerklärung');
	});

	test('the impressum renders its copy', async ({ page }) => {
		await page.goto(routes.de.imprint);

		await expect(page.locator('h1')).toHaveText('Impressum');
		await expect(page.locator('main')).toContainText('DE322286907');
	});
});

// Scrolled past the terminal the browser's own scroll keys have to keep working,
// otherwise a long document such as the Datenschutzerklärung looks frozen.
async function scrollBelowTerminal(page: Page) {
	const bottom = () =>
		page.evaluate(
			() =>
				document.querySelector('[data-terminal]')?.getBoundingClientRect()
					.bottom ?? 0,
		);

	await page.evaluate(
		(offset) => window.scrollTo(0, window.scrollY + offset + 100),
		await bottom(),
	);
	await expect.poll(bottom).toBeLessThanOrEqual(0);
}

test.describe('arrow keys below the terminal', () => {
	test('scroll the document once the terminal is out of view', async ({
		page,
	}) => {
		await page.goto(routes.de.privacy);
		await waitForMenu(page);
		await scrollBelowTerminal(page);

		const before = await page.evaluate(() => window.scrollY);
		await page.keyboard.press('ArrowDown');
		await page.keyboard.press('ArrowDown');

		await expect
			.poll(() => page.evaluate(() => window.scrollY))
			.toBeGreaterThan(before);
	});

	test('leave the submenu cursor alone while the terminal is out of view', async ({
		page,
	}) => {
		await page.goto(routes.de.privacy);
		await waitForMenu(page);
		await scrollBelowTerminal(page);

		await page.keyboard.press('ArrowDown');
		await expect(page.getByTestId('legal-privacy')).toHaveClass(/row-selected/);
	});

	test('still drive the submenu while the terminal is in view', async ({
		page,
	}) => {
		await page.goto(routes.de.privacy);
		await waitForMenu(page);

		await page.keyboard.press('ArrowDown');
		await expect(page.getByTestId('legal-imprint')).toHaveClass(/row-selected/);
	});

	test('⎋ still steps back from the bottom of a document', async ({ page }) => {
		await page.goto(routes.de.privacy);
		await waitForMenu(page);
		await scrollBelowTerminal(page);

		await page.keyboard.press('Escape');
		await expect(page).toHaveURL(new RegExp(`${routes.de.legal}/?$`));

		await page.keyboard.press('ArrowDown');
		await expect(page.getByTestId('legal-privacy')).toHaveClass(/row-selected/);
	});
});
