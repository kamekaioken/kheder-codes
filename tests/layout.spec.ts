import { expect, type Page, test } from '@playwright/test';
import { openTerminalFromHero, routes, waitForMenu } from './helpers';

const phone = { width: 390, height: 844 } as const;
/** Narrow enough that the terminal lies along the bottom edge instead of taking
 *  a column of its own. */
const narrow = { width: 960, height: 800 } as const;

function dock(page: Page) {
	return page.getByTestId('terminal');
}

/** The panel slides in on its first paint, so wait for it to come to rest before
 *  measuring where it sits. */
async function settled(page: Page) {
	await waitForMenu(page);
	await expect(dock(page)).not.toHaveClass(/animate-fade-up/, {
		timeout: 3000,
	});
}

async function dockBox(page: Page) {
	const box = await dock(page).boundingBox();
	if (!box) throw new Error('the dock has no box');
	return box;
}

function viewportHeight(page: Page) {
	return page.evaluate(() => window.innerHeight);
}

test.describe('the terminal along the bottom edge', () => {
	test.use({ viewport: narrow });

	test('sits on the bottom edge of the viewport and stays there while scrolling', async ({
		page,
	}) => {
		await page.goto(routes.de.privacy);
		await settled(page);

		const height = await viewportHeight(page);
		expect((await dockBox(page)).y + (await dockBox(page)).height).toBeCloseTo(
			height,
			0,
		);

		await page.mouse.wheel(0, 900);
		await expect
			.poll(async () => Math.round((await dockBox(page)).y))
			.toBeLessThan(height);
		expect((await dockBox(page)).y + (await dockBox(page)).height).toBeCloseTo(
			height,
			0,
		);
		await expect(page.getByTestId('menu-home')).toBeVisible();
	});

	test('never buries the end of the page underneath itself', async ({
		page,
	}) => {
		await page.goto(routes.de.privacy);
		await settled(page);

		await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
		await expect
			.poll(async () => {
				const footer = await page.locator('footer').boundingBox();
				return Math.round((footer?.y ?? 0) + (footer?.height ?? 0));
			})
			.toBeLessThanOrEqual(Math.round((await dockBox(page)).y) + 1);
	});

	test('the content starts at the top of the page, above the terminal', async ({
		page,
	}) => {
		await page.goto(routes.de.refs);
		await settled(page);

		const heading = await page.locator('h1').boundingBox();
		expect(heading?.y ?? 0).toBeLessThan((await dockBox(page)).y);
	});
});

test.describe('folding the panel away', () => {
	test.use({ viewport: narrow });

	test('the chevron collapses the panel to its title bar and back', async ({
		page,
	}) => {
		await page.goto(routes.de.refs);
		await settled(page);

		const open = (await dockBox(page)).height;

		await page.getByTestId('dock-toggle').click();
		await expect(page.getByTestId('menu-home')).toBeHidden();
		await expect(page.getByTestId('dock-toggle')).toHaveAttribute(
			'aria-expanded',
			'false',
		);
		await expect
			.poll(async () => (await dockBox(page)).height)
			.toBeLessThan(80);
		await expect(page.getByTestId('term-title')).toBeVisible();

		await page.getByTestId('dock-toggle').click();
		await expect(page.getByTestId('menu-home')).toBeVisible();
		await expect
			.poll(async () => Math.round((await dockBox(page)).height))
			.toBe(Math.round(open));
	});

	test('the yellow traffic light and the title bar itself fold it too', async ({
		page,
	}) => {
		await page.goto(routes.de.refs);
		await waitForMenu(page);

		await page.getByRole('button', { name: 'Minimieren' }).click();
		await expect(page.getByTestId('menu-home')).toBeHidden();

		await page.getByTestId('dock-bar').click();
		await expect(page.getByTestId('menu-home')).toBeVisible();
	});

	test('a menu key pops the panel back open', async ({ page }) => {
		await page.goto(routes.de.refs);
		await waitForMenu(page);

		await page.getByTestId('dock-toggle').click();
		await expect(page.getByTestId('menu-home')).toBeHidden();

		await page.keyboard.press('ArrowDown');
		await expect(page.getByTestId('menu-home')).toBeVisible();
		await expect(page.getByTestId('menu-contact')).toHaveClass(/row-selected/);
	});

	test('the collapsed panel keeps its menu out of the tab order', async ({
		page,
	}) => {
		await page.goto(routes.de.refs);
		await waitForMenu(page);
		await page.getByTestId('dock-toggle').click();

		await expect(page.getByTestId('menu-home')).toBeHidden();
		await expect(page.getByTestId('menu-home')).not.toBeFocused();
	});
});

test.describe('the terminal in its own column', () => {
	test('stands on the left, full height, with the page beside it', async ({
		page,
	}) => {
		await page.goto(routes.de.refs);
		await settled(page);

		const viewport = page.viewportSize();
		const box = await dockBox(page);

		expect(box.x).toBe(0);
		expect(box.y).toBe(0);
		expect(box.height).toBeCloseTo(viewport?.height ?? 0, 0);
		expect(box.width).toBeLessThan((viewport?.width ?? 0) / 2);

		const heading = await page.locator('h1').boundingBox();
		expect(heading?.x ?? 0).toBeGreaterThanOrEqual(box.width);
	});

	test('covers nothing, so it offers no way to fold it away', async ({
		page,
	}) => {
		await page.goto(routes.de.refs);
		await settled(page);

		await expect(page.getByTestId('dock-toggle')).toBeHidden();
		await expect(page.getByRole('button', { name: 'Minimieren' })).toHaveCount(
			0,
		);

		await page.getByTestId('dock-bar').click();
		await expect(page.getByTestId('menu-home')).toBeVisible();
	});

	test('the page keeps the column free instead of the bottom edge', async ({
		page,
	}) => {
		await page.goto(routes.de.refs);
		await settled(page);

		const shell = page.locator('[data-shell]');
		await expect(shell).toHaveCSS('padding-bottom', '0px');
		await expect(shell).not.toHaveCSS('padding-left', '0px');

		await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
		const footer = await page.locator('footer').boundingBox();
		expect(footer?.x ?? 0).toBeGreaterThanOrEqual((await dockBox(page)).width);
	});
});

test.describe('the arrows belong to whoever is reading', () => {
	test('they drive the menu from the page itself', async ({ page }) => {
		await page.goto(routes.de.refs);
		await waitForMenu(page);

		await page.keyboard.press('ArrowDown');
		await expect(page.getByTestId('menu-contact')).toHaveClass(/row-selected/);
	});

	test('they leave the menu alone once the focus is in the content', async ({
		page,
	}) => {
		await page.goto(routes.de.refs);
		await waitForMenu(page);

		await page.locator('main a').first().focus();
		await page.keyboard.press('ArrowDown');

		await expect(page.getByTestId('menu-refs')).toHaveClass(/row-selected/);
	});
});

test.describe('on a phone', () => {
	test.use({ viewport: phone });

	test('a content page is read against the title bar alone', async ({
		page,
	}) => {
		await page.goto(routes.de.refs);
		await expect(page.getByTestId('terminal')).toBeVisible();

		await expect(page.getByTestId('menu-home')).toBeHidden();
		await expect
			.poll(async () => (await dockBox(page)).height)
			.toBeLessThan(80);
		await expect(page.locator('h1')).toBeVisible();
	});

	test('a submenu page opens the panel, because there is something to choose', async ({
		page,
	}) => {
		await page.goto(routes.de.blog);
		await waitForMenu(page);

		await expect(page.getByTestId('blog-submenu')).toBeVisible();
		await expect(page.getByTestId('post-1')).toBeInViewport();
	});

	// Picking a `.md` file is asking to read it, so the panel gets out of the way
	// instead of leaving the document to a sliver of screen.
	test('picking a markdown file folds the panel away', async ({ page }) => {
		await page.goto(routes.de.team);
		await waitForMenu(page);

		await page.getByTestId('member-1').click();
		await expect(page).toHaveURL(new RegExp(`${routes.de.member}/?$`));

		await expect(page.getByTestId('member-1')).toBeHidden();
		await expect
			.poll(async () => (await dockBox(page)).height)
			.toBeLessThan(80);
		await expect(page.locator('h1')).toHaveText('Marlen Kheder');
	});

	test('every kind of document folds it, and its own index does not', async ({
		page,
	}) => {
		for (const path of [routes.de.post, routes.de.privacy, routes.de.member]) {
			await page.goto(path);
			await expect(page.getByTestId('terminal'), path).toBeVisible();
			await expect
				.poll(async () => (await dockBox(page)).height, { message: path })
				.toBeLessThan(80);
		}

		for (const path of [routes.de.team, routes.de.blog, routes.de.legal]) {
			await page.goto(path);
			await waitForMenu(page);
			await expect
				.poll(async () => (await dockBox(page)).height, { message: path })
				.toBeGreaterThan(80);
		}
	});

	test('tapping the bar opens it, and the next page folds it away again', async ({
		page,
	}) => {
		await page.goto(routes.de.refs);
		await expect(page.getByTestId('menu-home')).toBeHidden();

		await page.getByTestId('dock-bar').click();
		await waitForMenu(page);

		await page.getByTestId('menu-contact').click();
		await expect(page).toHaveURL(new RegExp(`${routes.de.contact}/?$`));
		await expect(page.getByTestId('menu-contact')).toBeHidden();
		await expect(page.locator('h1')).toHaveText('Sag hallo.');
	});
});

test.describe('the home page', () => {
	test('is the root of the menu and reads beside the terminal', async ({
		page,
	}) => {
		await page.goto(routes.de.home);
		await openTerminalFromHero(page);

		const rows = page.locator('[data-testid^="menu-"]');
		await expect(rows.first()).toHaveAttribute('data-testid', 'menu-home');
		await expect(page.getByTestId('menu-home')).toHaveClass(/row-selected/);
		await expect(page.getByTestId('menu-home')).toHaveAttribute(
			'aria-current',
			'page',
		);

		const heading = page.locator('h1');
		await expect(heading).toHaveText('Servus, wir sind KHEDER.codes.');

		const box = await dockBox(page);
		expect((await heading.boundingBox())?.x ?? 0).toBeGreaterThanOrEqual(
			box.width,
		);
	});
});
