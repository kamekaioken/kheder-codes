import { m } from '../paraglide/messages.js';
import type { BlogEntry } from './blog';
import { type Locale, locales, pathFor } from './i18n';
import { site } from './site';
import { themes } from './theme';

export type TerminalItem = {
	id: string;
	name: string;
	desc: string;
	href: string;
	external: boolean;
	submenu: 'blog' | 'settings' | null;
};

export function buildMenu(locale: Locale): TerminalItem[] {
	const o = { locale };

	return [
		{
			id: 'about',
			name: m.menu_about({}, o),
			desc: m.menu_about_desc({}, o),
			href: pathFor('about', locale),
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
	];
}

/** `blog/` and `einstellungen/` double as the commands echoed in the submenu prompt. */
function commandOf(items: TerminalItem[], id: string): string {
	return items.find((item) => item.id === id)?.name.replace(/\/$/, '') ?? id;
}

export function buildLabels(locale: Locale, items: TerminalItem[]) {
	const o = { locale };
	const blogCmd = commandOf(items, 'blog');
	const settingsCmd = commandOf(items, 'settings');

	return {
		heroKey: m.hero_key({}, o),
		heroHint: m.hero_hint({}, o),
		closeTitle: m.term_close_title({}, o),
		titleHome: m.term_title({ cwd: '~' }, o),
		titleBlog: m.term_title({ cwd: `~/${blogCmd}` }, o),
		titleSettings: m.term_title({ cwd: `~/${settingsCmd}` }, o),
		version: m.term_version({}, o),
		choose: m.term_choose({}, o),
		navLabel: m.term_nav_label({}, o),
		hintMain: m.hint_main({}, o),
		hintBlog: m.hint_blog({}, o),
		hintSettings: m.hint_settings({}, o),
		blogCmd,
		blogCount: m.blog_submenu_count({}, o),
		blogNavLabel: m.blog_submenu_label({}, o),
		wip: m.badge_wip({}, o),
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
) {
	return locales
		.filter((candidate) => alternates[candidate] !== undefined)
		.map((candidate) => ({
			locale: candidate,
			name: m.locale_name({}, { locale: candidate }),
			href: alternates[candidate] as string,
			active: candidate === locale,
		}));
}

export function buildThemeOptions(locale: Locale) {
	const names = {
		system: m.settings_theme_system({}, { locale }),
		light: m.settings_theme_light({}, { locale }),
		dark: m.settings_theme_dark({}, { locale }),
	};

	return themes.map((value) => ({ value, name: names[value] }));
}

export function toTerminalPosts(posts: BlogEntry[]) {
	return posts.map(({ file, title, href }) => ({ file, title, href }));
}
