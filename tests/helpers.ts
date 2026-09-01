import { expect, type Page } from '@playwright/test';

export const routes = {
	de: {
		home: '/',
		team: '/team',
		member: '/team/marlen-kheder',
		blog: '/blog',
		post: '/blog/voice-agents-mit-livekit',
		refs: '/referenzen',
		contact: '/kontakt',
		legal: '/rechtliches',
		imprint: '/impressum',
		privacy: '/datenschutz',
	},
	en: {
		home: '/en/',
		team: '/en/team',
		member: '/en/team/marlen-kheder',
		blog: '/en/blog',
		post: '/en/blog/voice-agents-with-livekit',
		refs: '/en/references',
		contact: '/en/contact',
	},
} as const;

/** The main menu only becomes interactive once the staggered reveal has finished. */
export async function waitForMenu(page: Page) {
	await expect(page.getByTestId('terminal')).toBeVisible();
	await expect(page.getByTestId('menu-legal')).toBeVisible();
	await expect(page.getByTestId('menu-legal')).toHaveCSS('opacity', '1');
}

/** Plays the intro on `/` and lands in the terminal phase. */
export async function openTerminalFromHero(page: Page) {
	await expect(page.getByTestId('hero')).toBeVisible();
	await page.keyboard.press('Enter');
	await expect(page.locator('html')).toHaveAttribute('data-phase', 'term');
	await waitForMenu(page);
}

/** Settings has no page of its own: the panel unfolds over whatever is open. */
export async function openSettings(page: Page) {
	await waitForMenu(page);
	await page.getByTestId('menu-settings').click();
	await expect(page.getByTestId('settings-submenu')).toBeVisible();
}

export function selectedRows(page: Page) {
	return page.locator('[data-testid="main-menu"] .row-selected');
}
