import { navigate } from 'astro:transitions/client';
import { createContext } from 'svelte';
import type { TerminalProps } from '../../lib/terminal';
import { BootSequence } from './boot.svelte';
import { handleTerminalKey } from './keymap';
import { SettingsPanel } from './settings.svelte';

const DEFAULT_SPEED = 70;

export type TerminalSubmenu = 'blog' | 'settings' | null;

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

	/** Cursors follow the route by default and stay put once moved by hand. */
	selected = $derived(this.#itemIndex);
	postSelected = $derived(this.#postIndex);

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
		if (this.current !== 'home') navigate(this.#props().homeHref);
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
}

export const [getSession, setSession] = createContext<TerminalSession>();
