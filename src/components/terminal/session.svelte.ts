import { navigate } from 'astro:transitions/client';
import { createContext } from 'svelte';
import {
	submenuOf,
	type TerminalProps,
	type TerminalRoute,
} from '../../lib/terminal';
import { BootSequence } from './boot.svelte';
import { handleTerminalKey } from './keymap';
import { SettingsPanel } from './settings.svelte';

const DEFAULT_SPEED = 70;

/**
 * What the kheder terminal knows about the page it is on: the menu, the current
 * route and where the cursors point. The island creates one and puts it in
 * context, so no subcomponent needs props. The intro lives in `boot`, the
 * settings submenu in `settings`.
 */
export class TerminalSession {
	readonly boot: BootSequence;
	readonly settings: SettingsPanel;

	#props: () => TerminalProps;
	#screen: HTMLElement | null = null;

	constructor(props: () => TerminalProps) {
		this.#props = props;

		this.boot = new BootSequence({
			intro: Boolean(props().showIntro),
			speed: props().typingSpeed ?? DEFAULT_SPEED,
			rowCount: () => this.items.length,
		});

		this.settings = new SettingsPanel({
			languages: () => this.#props().languages,
			themeOptions: () => this.#props().themeOptions,
			open: (href) => this.go(href),
		});
	}

	get items() {
		return this.#props().items;
	}

	get posts() {
		return this.#props().posts;
	}

	get legalDocs() {
		return this.#props().legalDocs;
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

	get homeHref() {
		return this.#props().homeHref;
	}

	get blogHref() {
		return this.#props().blogHref;
	}

	get legalHref() {
		return this.#props().legalHref;
	}

	readonly submenu = $derived(submenuOf[this.current]);

	/** A leaf route highlights the main-menu row of the submenu it sits in. */
	readonly activeItemId = $derived(this.submenu ?? this.current);

	readonly title = $derived(this.labels.titles[this.submenu ?? 'main']);

	readonly hint = $derived(this.labels.hints[this.submenu ?? 'main']);

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

	readonly #legalIndex = $derived(
		Math.max(
			0,
			this.legalDocs.findIndex((doc) => doc.id === this.current),
		),
	);

	/** Cursors follow the route by default and stay put once moved by hand. */
	selected = $derived(this.#itemIndex);
	postSelected = $derived(this.#postIndex);
	legalSelected = $derived(this.#legalIndex);

	/** Leaf routes step back into their submenu, everything else to the main menu. */
	readonly #parentHref: Partial<Record<TerminalRoute, string>> = $derived({
		post: this.blogHref,
		imprint: this.legalHref,
		privacy: this.legalHref,
	});

	/** `TerminalScreen` hands over its window element on mount. */
	bindScreen(element: HTMLElement | null): void {
		this.#screen = element;
	}

	/** Whether any part of the terminal window is on screen. Unbound (server, or
	 *  before mount) it counts as visible, so nothing is swallowed by accident. */
	get screenInView(): boolean {
		const rect = this.#screen?.getBoundingClientRect();
		if (!rect) return true;
		return rect.bottom > 0 && rect.top < window.innerHeight;
	}

	attach(): () => void {
		this.settings.load();
		this.boot.begin();

		const onKey = (event: KeyboardEvent) => this.handleKey(event);
		const onScroll = () => this.boot.openTerminal();
		const onSwap = () => this.boot.syncPhase();

		window.addEventListener('keydown', onKey);
		window.addEventListener('wheel', onScroll, { passive: true });
		window.addEventListener('touchmove', onScroll, { passive: true });
		document.addEventListener('astro:after-swap', onSwap);

		return () => {
			this.boot.dispose();
			window.removeEventListener('keydown', onKey);
			window.removeEventListener('wheel', onScroll);
			window.removeEventListener('touchmove', onScroll);
			document.removeEventListener('astro:after-swap', onSwap);
		};
	}

	handleKey(event: KeyboardEvent): void {
		handleTerminalKey(this, event);
	}

	resetToHero(): void {
		this.boot.replay();
		window.scrollTo({ top: 0 });
		if (this.current !== 'home') navigate(this.homeHref);
	}

	go(href: string): void {
		if (window.scrollY > 0) window.scrollTo({ top: 0, behavior: 'smooth' });
		navigate(href);
	}

	goBack(): void {
		const parent = this.#parentHref[this.current];
		if (parent) this.go(parent);
		else if (this.current !== 'home') this.go(this.homeHref);
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

	openLegal(index: number): void {
		const doc = this.legalDocs[index];
		if (!doc) return;
		this.legalSelected = index;
		this.go(doc.href);
	}
}

export const [getSession, setSession] = createContext<TerminalSession>();
