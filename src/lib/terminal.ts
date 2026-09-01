import { m } from '../paraglide/messages.js';
import type { BlogEntry } from './blog';
import { type Locale, locales, pathFor } from './i18n';
import type { LegalDoc } from './legal';
import { site } from './site';
import { type Theme, themes } from './theme';

export type TerminalItem = {
	id: string;
	name: string;
	desc: string;
	href: string;
	external: boolean;
	submenu: TerminalSubmenu;
};

export type TerminalPost = { file: string; title: string; href: string };

export type TerminalLegalDoc = { id: string; file: string; href: string };

export type LanguageOption = {
	locale: Locale;
	name: string;
	href: string;
	active: boolean;
};

export type ThemeOption = { value: Theme; name: string };

export type TerminalRoute =
	| 'home'
	| 'blog'
	| 'refs'
	| 'contact'
	| 'settings'
	| 'post'
	| 'legal'
	| 'imprint'
	| 'privacy';

export type TerminalSubmenu = 'blog' | 'settings' | 'legal' | null;

/** Which submenu a route opens. Leaf routes name the submenu they belong to,
 *  which is also how the main menu knows which row to mark as current. */
export const submenuOf: Record<TerminalRoute, TerminalSubmenu> = {
	home: null,
	refs: null,
	contact: null,
	blog: 'blog',
	post: 'blog',
	settings: 'settings',
	legal: 'legal',
	imprint: 'legal',
	privacy: 'legal',
};

export type TerminalLabels = ReturnType<typeof buildLabels>;

export type TerminalProps = {
	items: TerminalItem[];
	posts: TerminalPost[];
	legalDocs: TerminalLegalDoc[];
	languages: LanguageOption[];
	themeOptions: ThemeOption[];
	labels: TerminalLabels;
	current: TerminalRoute;
	currentPostFile?: string | null;
	showIntro?: boolean;
	homeHref: string;
	blogHref: string;
	legalHref: string;
	typingSpeed?: number;
};

export function buildMenu(locale: Locale): TerminalItem[] {
	const o = { locale };

	return [
		{
			id: 'home',
			name: m.menu_home({}, o),
			desc: m.menu_home_desc({}, o),
			href: pathFor('home', locale),
			external: false,
			submenu: null,
		},
		{
			id: 'blog',
			name: m.menu_blog({}, o),
			desc: m.menu_blog_desc({}, o),
			href: pathFor('blog', locale),
			external: false,
			submenu: 'blog',
		},
		{
			id: 'refs',
			name: m.menu_refs({}, o),
			desc: m.menu_refs_desc({}, o),
			href: pathFor('refs', locale),
			external: false,
			submenu: null,
		},
		{
			id: 'contact',
			name: m.menu_contact({}, o),
			desc: m.menu_contact_desc({}, o),
			href: pathFor('contact', locale),
			external: false,
			submenu: null,
		},
		{
			id: 'donna',
			name: m.menu_donna({}, o),
			desc: m.menu_donna_desc({}, o),
			href: site.donnadesk,
			external: true,
			submenu: null,
		},
		{
			id: 'settings',
			name: m.menu_settings({}, o),
			desc: m.menu_settings_desc({}, o),
			href: pathFor('settings', locale),
			external: false,
			submenu: 'settings',
		},
		{
			id: 'legal',
			name: m.menu_legal({}, o),
			desc: m.menu_legal_desc({}, o),
			href: pathFor('legal', locale),
			external: false,
			submenu: 'legal',
		},
	];
}

/** `blog/`, `einstellungen/` and `rechtliches/` double as the commands echoed in
 *  the submenu prompt. */
function commandOf(items: TerminalItem[], id: string): string {
	return items.find((item) => item.id === id)?.name.replace(/\/$/, '') ?? id;
}

export function buildLabels(locale: Locale, items: TerminalItem[]) {
	const o = { locale };
	const blogCmd = commandOf(items, 'blog');
	const settingsCmd = commandOf(items, 'settings');
	/* The legal documents live under one German path in both locales, so the
	   echoed directory is fixed rather than taken from the translated menu row. */
	const legalCmd = 'rechtliches';

	return {
		heroKey: m.hero_key({}, o),
		heroHint: m.hero_hint({}, o),
		closeTitle: m.term_close_title({}, o),
		minimizeTitle: m.term_minimize_title({}, o),
		collapseTitle: m.term_collapse_title({}, o),
		restoreTitle: m.term_restore_title({}, o),
		/* Keyed by submenu, so the screen reads them as `titles[submenu ?? 'main']`. */
		titles: {
			main: m.term_title({ cwd: '~' }, o),
			blog: m.term_title({ cwd: `~/${blogCmd}` }, o),
			settings: m.term_title({ cwd: `~/${settingsCmd}` }, o),
			legal: m.term_title({ cwd: `~/${legalCmd}` }, o),
		},
		hints: {
			main: m.hint_main({}, o),
			blog: m.hint_blog({}, o),
			settings: m.hint_settings({}, o),
			legal: m.hint_legal({}, o),
		},
		version: m.term_version({}, o),
		choose: m.term_choose({}, o),
		navLabel: m.term_nav_label({}, o),
		blogCmd,
		blogCount: m.blog_submenu_count({}, o),
		blogNavLabel: m.blog_submenu_label({}, o),
		wip: m.badge_wip({}, o),
		legalCmd,
		legalCount: m.legal_submenu_count({}, o),
		legalNavLabel: m.legal_submenu_label({}, o),
		settingsCmd,
		settingsIntro: m.settings_intro({}, o),
		settingsLabel: m.settings_label({}, o),
		rowLanguage: m.settings_row_language({}, o),
		rowTheme: m.settings_row_theme({}, o),
	};
}

export function buildLanguages(
	locale: Locale,
	alternates: Partial<Record<Locale, string>>,
): LanguageOption[] {
	return locales
		.filter((candidate) => alternates[candidate] !== undefined)
		.map((candidate) => ({
			locale: candidate,
			name: m.locale_name({}, { locale: candidate }),
			href: alternates[candidate] as string,
			active: candidate === locale,
		}));
}

export function buildThemeOptions(locale: Locale): ThemeOption[] {
	const names = {
		system: m.settings_theme_system({}, { locale }),
		light: m.settings_theme_light({}, { locale }),
		dark: m.settings_theme_dark({}, { locale }),
	};

	return themes.map((value) => ({ value, name: names[value] }));
}

export function toTerminalPosts(posts: BlogEntry[]): TerminalPost[] {
	return posts.map(({ file, title, href }) => ({ file, title, href }));
}

export function toTerminalLegalDocs(docs: LegalDoc[]): TerminalLegalDoc[] {
	return docs.map(({ id, file, href }) => ({ id, file, href }));
}
