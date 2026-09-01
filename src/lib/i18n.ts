export const locales = ['de', 'en'] as const;

export type Locale = (typeof locales)[number];

export const baseLocale: Locale = 'de';

export const htmlLang: Record<Locale, string> = {
	de: 'de-DE',
	en: 'en-US',
};

export type RouteId =
	| 'home'
	| 'about'
	| 'blog'
	| 'refs'
	| 'contact'
	| 'settings'
	| 'legal'
	| 'imprint'
	| 'privacy';

const routePaths: Record<RouteId, Record<Locale, string>> = {
	home: { de: '/', en: '/en/' },
	about: { de: '/ueber-mich', en: '/en/about' },
	blog: { de: '/blog', en: '/en/blog' },
	refs: { de: '/referenzen', en: '/en/references' },
	contact: { de: '/kontakt', en: '/en/contact' },
	settings: { de: '/einstellungen', en: '/en/settings' },
	legal: { de: '/rechtliches', en: '/rechtliches' },
	imprint: { de: '/impressum', en: '/impressum' },
	privacy: { de: '/datenschutz', en: '/datenschutz' },
};

/** Impressum and Datenschutzerklärung are binding in German, so there is one
 *  version of each. Both menus link the same URL and no English alternate is
 *  advertised. */
const germanOnly = new Set<RouteId>(['legal', 'imprint', 'privacy']);

export function pathFor(id: RouteId, locale: Locale): string {
	return routePaths[id][locale];
}

export function blogPostPath(slug: string, locale: Locale): string {
	return `${routePaths.blog[locale]}/${slug}`;
}

export function isLocale(value: string | undefined): value is Locale {
	return locales.includes(value as Locale);
}

export function assertLocale(value: string | undefined): Locale {
	return isLocale(value) ? value : baseLocale;
}

export function alternatesFor(id: RouteId): Partial<Record<Locale, string>> {
	return germanOnly.has(id)
		? { de: routePaths[id].de }
		: { de: routePaths[id].de, en: routePaths[id].en };
}
