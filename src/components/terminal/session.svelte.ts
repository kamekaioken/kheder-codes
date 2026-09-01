import { navigate } from 'astro:transitions/client';
import { createContext } from 'svelte';
import {
	submenuOf,
	type TerminalProps,
	type TerminalRoute,
} from '../../lib/terminal';
import { BootSequence } from './boot.svelte';
import { TerminalDock } from './dock.svelte';
import { handleTerminalKey } from './keymap';
import { SettingsPanel } from './settings.svelte';

const DEFAULT_SPEED = 70;

/**
 * What the kheder terminal knows about the page it is on: the menu, the current
 * route and where the cursors point. The island creates one and puts it in
 * context, so no subcomponent needs props. The intro lives in `boot`, the
 * settings submenu in `settings` and the docked panel in `dock`.
 */
export class TerminalSession {
	#props: () => TerminalProps;

	readonly boot: BootSequence;
	readonly dock = new TerminalDock();
	readonly settings = new SettingsPanel({
		languages: () => this.#props().languages,
		themeOptions: () => this.#props().themeOptions,
		navigate: (href) => this.go(href),
	});

	constructor(props: () => TerminalProps) {
		this.#props = props;

		this.boot = new BootSequence({
			intro: Boolean(props().showIntro),
			speed: props().typingSpeed ?? DEFAULT_SPEED,
			rowCount: () => this.items.length,
		});
	}

	get items() {
		return this.#props().items;
	}

	get members() {
		return this.#props().members;
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

	/** The `.md` file the page is showing, for the submenu row that opened it. */
	get currentDocFile() {
		return this.#props().currentDocFile ?? null;
	}

	get showIntro() {
		return Boolean(this.#props().showIntro);
	}

	get homeHref() {
		return this.#props().homeHref;
	}

	get teamHref() {
		return this.#props().teamHref;
	}

	get blogHref() {
		return this.#props().blogHref;
	}

	get legalHref() {
		return this.#props().legalHref;
	}

	/** Settings owns no route: while its panel is unfolded it takes the screen
	 *  over whatever page is being read, and closing it hands the screen back. */
	readonly submenu = $derived(
		this.settings.expanded ? 'settings' : submenuOf[this.current],
	);

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

	readonly #memberIndex = $derived(
		Math.max(
			0,
			this.members.findIndex((member) => member.file === this.currentDocFile),
		),
	);

	readonly #postIndex = $derived(
		Math.max(
			0,
			this.posts.findIndex((post) => post.file === this.currentDocFile),
		),
	);

	readonly #legalIndex = $derived(
		Math.max(
			0,
			this.legalDocs.findIndex((doc) => doc.file === this.currentDocFile),
		),
	);

	/** Cursors follow the route by default and stay put once moved by hand. */
	selected = $derived(this.#itemIndex);
	memberSelected = $derived(this.#memberIndex);
	postSelected = $derived(this.#postIndex);
	legalSelected = $derived(this.#legalIndex);

	/** Leaf routes step back into their submenu, everything else to the main menu. */
	readonly #parentHref: Partial<Record<TerminalRoute, string>> = $derived({
		member: this.teamHref,
		post: this.blogHref,
		imprint: this.legalHref,
		privacy: this.legalHref,
	});

	attach(): () => void {
		this.settings.load();
		this.boot.begin();

		const detachDock = this.dock.attach();

		const onKey = (event: KeyboardEvent) => this.handleKey(event);
		const onScroll = () => this.boot.openTerminal();
		const onSwap = () => this.boot.syncPhase();

		window.addEventListener('keydown', onKey);
		window.addEventListener('wheel', onScroll, { passive: true });
		window.addEventListener('touchmove', onScroll, { passive: true });
		document.addEventListener('astro:after-swap', onSwap);

		return () => {
			this.boot.dispose();
			detachDock();
			window.removeEventListener('keydown', onKey);
			window.removeEventListener('wheel', onScroll);
			window.removeEventListener('touchmove', onScroll);
			document.removeEventListener('astro:after-swap', onSwap);
		};
	}

	/** Leaving a page folds the settings panel and re-applies the dock's own rule.
	 *  Switching language stays on the same route, so the panel survives it. */
	syncRoute(): void {
		this.settings.syncRoute(this.current);
		this.dock.syncRoute(this.current);
	}

	handleKey(event: KeyboardEvent): void {
		handleTerminalKey(this, event);
	}

	resetToHero(): void {
		this.settings.collapse();
		this.boot.replay();
		window.scrollTo({ top: 0 });
		if (this.current !== 'home') navigate(this.homeHref);
	}

	go(href: string): void {
		if (window.scrollY > 0) window.scrollTo({ top: 0, behavior: 'smooth' });
		navigate(href);
	}

	goBack(): void {
		if (this.settings.expanded) {
			this.settings.collapse();
			return;
		}
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
			window.open(item.href ?? '', '_blank', 'noopener');
			return;
		}
		/* A row without an href goes nowhere — it only unfolds its own panel. */
		if (item.href === null) {
			this.settings.expand();
			this.dock.expand();
			return;
		}
		this.settings.collapse();
		this.go(item.href);
	}

	openMember(index: number): void {
		const member = this.members[index];
		if (!member) return;
		this.memberSelected = index;
		this.go(member.href);
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
