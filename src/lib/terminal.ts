import { m } from '../paraglide/messages.js';
import type { BlogEntry } from './blog';
import { type Locale, locales, pathFor } from './i18n';
import type { LegalDoc } from './legal';
import { site } from './site';
import type { TeamMember } from './team';
import { type Theme, themes } from './theme';

export type TerminalItem = {
	id: string;
	name: string;
	desc: string;
	/** `null` for a row that only unfolds its submenu instead of going anywhere. */
	href: string | null;
	external: boolean;
	submenu: TerminalSubmenu;
};

export type TerminalDoc = { file: string; title: string; href: string };

export type TerminalPost = TerminalDoc;

export type TerminalMember = TerminalDoc & { role: string };

export type TerminalLegalDoc = TerminalDoc & { id: string };

export type LanguageOption = {
	locale: Locale;
	name: string;
	href: string;
	active: boolean;
};

export type ThemeOption = { value: Theme; name: string };

export type TerminalRoute =
	| 'home'
	| 'team'
	| 'member'
	| 'blog'
	| 'post'
	| 'refs'
	| 'contact'
	| 'legal'
	| 'imprint'
	| 'privacy';

export type TerminalSubmenu = 'team' | 'blog' | 'settings' | 'legal' | null;

/** Which submenu a route opens. Leaf routes name the submenu they belong to,
 *  which is also how the main menu knows which row to mark as current. Settings
 *  has no route of its own: it unfolds over whatever page you are reading. */
export const submenuOf: Record<TerminalRoute, TerminalSubmenu> = {
	home: null,
	refs: null,
	contact: null,
	team: 'team',
	member: 'team',
	blog: 'blog',
	post: 'blog',
	legal: 'legal',
	imprint: 'legal',
	privacy: 'legal',
};

/** Where a phone keeps the panel unfolded: the home screen and the index of a
 *  submenu, because there the menu is still the point. A document has nothing
 *  left to choose, so the terminal folds itself out of the way. */
const menuRoutes = new Set<TerminalRoute>(['home', 'team', 'blog', 'legal']);

export function menuIsThePoint(route: TerminalRoute): boolean {
	return menuRoutes.has(route);
}

export type TerminalLabels = ReturnType<typeof buildLabels>;

export type TerminalProps = {
	items: TerminalItem[];
	members: TerminalMember[];
	posts: TerminalPost[];
	legalDocs: TerminalLegalDoc[];
	languages: LanguageOption[];
	themeOptions: ThemeOption[];
	labels: TerminalLabels;
	current: TerminalRoute;
	currentDocFile?: string | null;
	showIntro?: boolean;
	homeHref: string;
	teamHref: string;
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
			id: 'team',
			name: m.menu_team({}, o),
			desc: m.menu_team_desc({}, o),
			href: pathFor('team', locale),
			external: false,
			submenu: 'team',
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
			href: null,
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

/** `team/`, `blog/`, `einstellungen/` and `rechtliches/` double as the commands
 *  echoed in the submenu prompt. */
function commandOf(items: TerminalItem[], id: string): string {
	return items.find((item) => item.id === id)?.name.replace(/\/$/, '') ?? id;
}

type Counts = { members: number; posts: number; legalDocs: number };

export function buildLabels(
	locale: Locale,
	items: TerminalItem[],
	counts: Counts,
) {
	const o = { locale };
	const teamCmd = commandOf(items, 'team');
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
			team: m.term_title({ cwd: `~/${teamCmd}` }, o),
			blog: m.term_title({ cwd: `~/${blogCmd}` }, o),
			settings: m.term_title({ cwd: `~/${settingsCmd}` }, o),
			legal: m.term_title({ cwd: `~/${legalCmd}` }, o),
		},
		/* Every list names how far its number keys reach, so a new entry does not
		   leave the hint line lying. */
		hints: {
			main: m.hint_main({ count: items.length }, o),
			team: m.hint_team({ count: counts.members }, o),
			blog: m.hint_blog({ count: counts.posts }, o),
			settings: m.hint_settings({}, o),
			legal: m.hint_legal({ count: counts.legalDocs }, o),
		},
		choose: m.term_choose({}, o),
		navLabel: m.term_nav_label({}, o),
		teamCmd,
		teamCount: m.team_submenu_count({}, o),
		teamNavLabel: m.team_submenu_label({}, o),
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

/** Both languages are always on offer. A page with no counterpart — the German
 *  legal documents — hands the other locale its home page rather than hiding the
 *  switch, which is the one row you may have come to the settings for. */
export function buildLanguages(
	locale: Locale,
	alternates: Partial<Record<Locale, string>>,
): LanguageOption[] {
	return locales.map((candidate) => ({
		locale: candidate,
		name: m.locale_name({}, { locale: candidate }),
		href: alternates[candidate] ?? pathFor('home', candidate),
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

export function toTerminalMembers(members: TeamMember[]): TerminalMember[] {
	return members.map(({ file, title, href, role }) => ({
		file,
		title,
		href,
		role,
	}));
}

export function toTerminalPosts(posts: BlogEntry[]): TerminalPost[] {
	return posts.map(({ file, title, href }) => ({ file, title, href }));
}

export function toTerminalLegalDocs(docs: LegalDoc[]): TerminalLegalDoc[] {
	return docs.map(({ id, file, title, href }) => ({ id, file, title, href }));
}
