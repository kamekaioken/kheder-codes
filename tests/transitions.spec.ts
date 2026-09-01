import { expect, type Page, test } from '@playwright/test';
import { openTerminalFromHero, routes, waitForMenu } from './helpers';

declare global {
	interface Window {
		playedAnimations?: string[];
		animationRecorderBound?: boolean;
	}
}

const ENTRANCE_SETTLED = 800;

/** Collects every CSS animation that starts from here on, keyed by test id. */
async function recordAnimations(page: Page) {
	await page.evaluate(() => {
		window.playedAnimations = [];
		if (window.animationRecorderBound) return;
		window.animationRecorderBound = true;
		document.addEventListener(
			'animationstart',
			(event) => {
				const target = event.target as HTMLElement;
				const name =
					target.dataset?.testid ??
					(target.dataset?.terminal !== undefined
						? 'terminal'
						: target.tagName.toLowerCase());
				window.playedAnimations?.push(`${name}:${event.animationName}`);
			},
			true,
		);
	});
}

function played(page: Page) {
	return page.evaluate(() => window.playedAnimations ?? []);
}

async function playedAfterSettling(page: Page) {
	await page.waitForTimeout(ENTRANCE_SETTLED);
	return played(page);
}

/** An entry animation only replays while its class is still on the element. */
async function settled(page: Page, testId: string, animation: string) {
	await expect(page.getByTestId(testId)).not.toHaveClass(
		new RegExp(animation),
		{ timeout: 3000 },
	);
}

test.describe('page transitions', () => {
	test('navigating animates only the new content', async ({ page }) => {
		await page.goto(routes.de.about);
		await waitForMenu(page);
		await settled(page, 'terminal', 'animate-fade-up');
		await recordAnimations(page);

		await page.getByTestId('menu-refs').click();
		await expect(page).toHaveURL(new RegExp(`${routes.de.refs}/?$`));
		await expect(page.locator('h1')).toHaveText('Referenzen');

		await expect
			.poll(() => played(page))
			.toEqual(expect.arrayContaining(['section:fade-up']));

		const animations = await playedAfterSettling(page);
		const replayed = animations.filter(
			(entry) =>
				entry.startsWith('terminal:') ||
				entry.startsWith('html:') ||
				entry.startsWith('body:') ||
				entry.startsWith('footer:'),
		);

		expect(replayed).toEqual([]);
	});

	test('the persisted terminal drops its entry animation once it has played', async ({
		page,
		request,
	}) => {
		const html = await (await request.get(routes.de.about)).text();
		const openingTag = html.match(/<div[^>]*data-terminal[^>]*>/)?.[0] ?? '';
		expect(openingTag).toContain('animate-fade-up');

		await page.goto(routes.de.about);
		await waitForMenu(page);

		const terminal = page.getByTestId('terminal');
		await expect(terminal).not.toHaveClass(/animate-fade-up/, {
			timeout: 3000,
		});

		await page.getByTestId('menu-contact').click();
		await expect(page).toHaveURL(new RegExp(`${routes.de.contact}/?$`));
		await expect(terminal).not.toHaveClass(/animate-fade-up/);
	});

	test('the blog submenu fades in when it opens, not while browsing on', async ({
		page,
	}) => {
		await page.goto(routes.de.about);
		await waitForMenu(page);
		await settled(page, 'terminal', 'animate-fade-up');
		await recordAnimations(page);

		await page.getByTestId('menu-blog').click();
		await expect(page.getByTestId('blog-submenu')).toBeVisible();
		await expect
			.poll(() => played(page))
			.toEqual(expect.arrayContaining(['blog-submenu:fade-in']));

		await settled(page, 'blog-submenu', 'animate-fade-in');
		await recordAnimations(page);

		await page.getByTestId('post-2').click();
		await expect(page).toHaveURL(
			new RegExp('/blog/monorepos-ohne-kopfschmerzen/?$'),
		);

		const animations = await playedAfterSettling(page);

		expect(
			animations.filter((entry) => entry.startsWith('blog-submenu:')),
		).toEqual([]);
	});

	test('the terminal still fades in when the hero closes', async ({ page }) => {
		await page.goto('/');
		await recordAnimations(page);
		await openTerminalFromHero(page);

		await expect
			.poll(() => played(page))
			.toEqual(expect.arrayContaining(['terminal:fade-up']));
	});
});
