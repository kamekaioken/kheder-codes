import { navigate } from 'astro:transitions/client';
import { createContext } from 'svelte';
import { forgetIntro, introSeen, markIntroSeen } from '../../lib/intro';
import type { TerminalProps } from '../../lib/terminal';
import { applyTheme, readTheme, storeTheme, type Theme } from '../../lib/theme';
import { Entrance } from '../ui/terminal/entrance.svelte';
import { cycle } from '../ui/terminal/navigation';
import { Typewriter } from '../ui/terminal/typewriter.svelte';
import { handleTerminalKey } from './keymap';

const HERO_TEXT = 'KHEDER.codes';
const HERO_BREAK = 6;
const COMMAND_TEXT = 'kheder';
const REVEAL_STEP = 90;
const OUTPUT_DELAY = 260;
const WINDOW_ENTRANCE = 600;

export type TerminalPhase = 'hero' | 'term';
export type TerminalSubmenu = 'blog' | 'settings' | null;

/**
 * Everything the kheder terminal knows about itself. The island creates one and
 * puts it in context so the hero, the window and the submenus can read the same
 * state without threading a dozen props through every level.
 */
export class TerminalSession {
	readonly heroText = HERO_TEXT;
	readonly heroBreak = HERO_BREAK;
	readonly commandText = COMMAND_TEXT;

	readonly hero: Typewriter;
	readonly command: Typewriter;
	readonly rows: Typewriter;
	readonly entrance = new Entrance(WINDOW_ENTRANCE);

	phase = $state<TerminalPhase>('term');
	heroDone = $state(true);
	menuOn = $state(true);
	theme = $state<Theme>('system');
	settingsRow = $state(0);

	#props: () => TerminalProps;
	#outputTimer: ReturnType<typeof setTimeout> | undefined;

	constructor(props: () => TerminalProps) {
		this.#props = props;

		const speed = props().typingSpeed ?? 70;

		this.hero = new Typewriter({
			total: HERO_TEXT.length,
			speed,
			onDone: () => {
				this.heroDone = true;
				markIntroSeen();
			},
		});
		this.command = new Typewriter({
			total: COMMAND_TEXT.length,
			speed: speed + 20,
			onDone: () => {
				this.#outputTimer = setTimeout(() => this.#revealRows(), OUTPUT_DELAY);
			},
		});
		this.rows = new Typewriter({
			total: () => this.items.length,
			speed: REVEAL_STEP,
		});

		if (props().showIntro) {
			this.phase = 'hero';
			this.#rewind();
		} else {
			this.#fastForward();
		}
	}

	get items() {
		return this.#props().items;
	}

	get posts() {
		return this.#props().posts;
	}

	get languages() {
		return this.#props().languages;
	}

	get themeOptions() {
		return this.#props().themeOptions;
	}

	get labels() {
		return this.#props().labels;
	}

	get current() {
		return this.#props().current;
	}

	get currentPostFile() {
		return this.#props().currentPostFile ?? null;
	}

	get showIntro() {
		return Boolean(this.#props().showIntro);
	}

	get heroCursorLine() {
		return this.hero.count <= HERO_BREAK ? 1 : 2;
	}

	readonly submenu: TerminalSubmenu = $derived(
		this.current === 'blog' || this.current === 'post'
			? 'blog'
			: this.current === 'settings'
				? 'settings'
				: null,
	);

	readonly activeItemId = $derived(
		this.current === 'post' ? 'blog' : this.current,
	);

	readonly title = $derived(
		this.submenu === 'blog'
			? this.labels.titleBlog
			: this.submenu === 'settings'
				? this.labels.titleSettings
				: this.labels.titleHome,
	);

	readonly hint = $derived(
		this.submenu === 'blog'
			? this.labels.hintBlog
			: this.submenu === 'settings'
				? this.labels.hintSettings
				: this.labels.hintMain,
	);

	readonly #itemIndex = $derived(
		Math.max(
			0,
			this.items.findIndex((item) => item.id === this.activeItemId),
		),
	);

	readonly #postIndex = $derived(
		Math.max(
			0,
			this.posts.findIndex((post) => post.file === this.currentPostFile),
		),
	);

	readonly #languageIndex = $derived(
		Math.max(
			0,
			this.languages.findIndex((option) => option.active),
		),
	);

	readonly #themeIndex = $derived(
		Math.max(
			0,
			this.themeOptions.findIndex((option) => option.value === this.theme),
		),
	);

	/** Cursors follow the route by default and stay put once moved by hand. */
	selected = $derived(this.#itemIndex);
	postSelected = $derived(this.#postIndex);
	langCursor = $derived(this.#languageIndex);
	themeCursor = $derived(this.#themeIndex);

	attach(): () => void {
		this.theme = readTheme();

		if (this.phase === 'hero') {
			if (introSeen()) this.openInstantly();
			else this.hero.start();
		}
		const settled = this.entrance.settle();

		const onKey = (event: KeyboardEvent) => this.handleKey(event);
		const onScroll = () => {
			if (this.phase === 'hero') this.startTerminal();
		};
		const onSwap = () => this.syncPhase();

		window.addEventListener('keydown', onKey);
		window.addEventListener('wheel', onScroll, { passive: true });
		window.addEventListener('touchmove', onScroll, { passive: true });
		document.addEventListener('astro:after-swap', onSwap);

		return () => {
			settled();
			this.#clearTimers();
			window.removeEventListener('keydown', onKey);
			window.removeEventListener('wheel', onScroll);
			window.removeEventListener('touchmove', onScroll);
			document.removeEventListener('astro:after-swap', onSwap);
		};
	}

	syncPhase(): void {
		document.documentElement.dataset.phase = this.phase;
	}

	handleKey(event: KeyboardEvent): void {
		handleTerminalKey(this, event);
	}

	startTerminal(): void {
		if (this.phase !== 'hero') return;
		this.#clearTimers();
		this.phase = 'term';
		this.hero.finish();
		this.heroDone = true;
		markIntroSeen();
		this.entrance.replay();
		this.command.start();
	}

	openInstantly(): void {
		this.#clearTimers();
		this.phase = 'term';
		this.#fastForward();
	}

	resetToHero(): void {
		this.#clearTimers();
		forgetIntro();
		this.phase = 'hero';
		this.#rewind();
		window.scrollTo({ top: 0 });
		if (this.current !== 'home') navigate(this.#props().homeHref);
		this.hero.start();
	}

	go(href: string): void {
		if (window.scrollY > 0) window.scrollTo({ top: 0, behavior: 'smooth' });
		navigate(href);
	}

	goBack(): void {
		if (this.current === 'post') this.go(this.#props().blogHref);
		else if (this.current !== 'home') this.go(this.#props().homeHref);
		else this.resetToHero();
	}

	open(index: number): void {
		const item = this.items[index];
		if (!item) return;
		this.selected = index;
		if (item.external) {
			window.open(item.href, '_blank', 'noopener');
			return;
		}
		this.go(item.href);
	}

	openPost(index: number): void {
		const post = this.posts[index];
		if (!post) return;
		this.postSelected = index;
		this.go(post.href);
	}

	setTheme(theme: Theme): void {
		this.theme = theme;
		storeTheme(theme);
		applyTheme(theme);
	}

	moveValueCursor(delta: number): void {
		if (this.settingsRow === 0) {
			this.langCursor = cycle(this.langCursor, delta, this.languages.length);
			return;
		}
		this.themeCursor = cycle(this.themeCursor, delta, this.themeOptions.length);
	}

	applySettingsRow(): void {
		if (this.settingsRow === 0) {
			const option = this.languages[this.langCursor];
			if (option && !option.active) this.go(option.href);
			return;
		}
		const option = this.themeOptions[this.themeCursor];
		if (option) this.setTheme(option.value);
	}

	#revealRows(): void {
		this.menuOn = true;
		this.rows.reset();
		this.rows.start();
	}

	#rewind(): void {
		this.heroDone = false;
		this.menuOn = false;
		this.hero.reset();
		this.command.reset();
		this.rows.reset();
	}

	#fastForward(): void {
		this.heroDone = true;
		this.menuOn = true;
		this.hero.finish();
		this.command.finish();
		this.rows.finish();
	}

	#clearTimers(): void {
		clearTimeout(this.#outputTimer);
		this.hero.stop();
		this.command.stop();
		this.rows.stop();
	}
}

export const [getSession, setSession] = createContext<TerminalSession>();
