import { expect, type Page } from '@playwright/test';

export const routes = {
	de: {
		home: '/',
		about: '/ueber-mich',
		blog: '/blog',
		post: '/blog/voice-agents-mit-livekit',
		refs: '/referenzen',
		contact: '/kontakt',
		settings: '/einstellungen',
	},
	en: {
		home: '/en/',
		about: '/en/about',
		blog: '/en/blog',
		post: '/en/blog/voice-agents-with-livekit',
		refs: '/en/references',
		contact: '/en/contact',
		settings: '/en/settings',
	},
} as const;

/** The main menu only becomes interactive once the staggered reveal has finished. */
export async function waitForMenu(page: Page) {
	await expect(page.getByTestId('terminal')).toBeVisible();
	await expect(page.getByTestId('menu-settings')).toBeVisible();
	await expect(page.getByTestId('menu-settings')).toHaveCSS('opacity', '1');
}

/** Plays the intro on `/` and lands in the terminal phase. */
export async function openTerminalFromHero(page: Page) {
	await expect(page.getByTestId('hero')).toBeVisible();
	await page.keyboard.press('Enter');
	await expect(page.locator('html')).toHaveAttribute('data-phase', 'term');
	await waitForMenu(page);
}

export function selectedRows(page: Page) {
	return page.locator('[data-testid="main-menu"] .row-selected');
}
