import type { TerminalRoute, TerminalSubmenu } from '../../lib/terminal';

const COMPACT_QUERY = '(max-width: 767px)';

/**
 * The panel docked to the bottom edge of the shell. On a wide screen it stays
 * open like an IDE terminal and the page scrolls behind it; on a phone it only
 * stays open where the menu is still the point — the home screen and the
 * submenus — so a content page is read against the title bar alone.
 *
 * Its measured height is published as `--dock-h`, which is the room the page
 * keeps free underneath the content.
 */
export class TerminalDock {
	open = $state(true);
	compact = $state(false);

	#body: HTMLElement | null = null;
	#sizes: ResizeObserver | undefined;
	#route: TerminalRoute | null = null;
	#hasSubmenu = false;

	attach(): () => void {
		const query = window.matchMedia(COMPACT_QUERY);
		const onChange = () => this.#setCompact(query.matches);

		this.#setCompact(query.matches);
		query.addEventListener('change', onChange);

		return () => {
			query.removeEventListener('change', onChange);
			this.#sizes?.disconnect();
			document.documentElement.style.removeProperty('--dock-h');
		};
	}

	/** The panel measures itself, so the page below always keeps its height free,
	 *  including while the collapse animation is still running. */
	bindPanel(element: HTMLElement | null): void {
		this.#sizes?.disconnect();
		if (!element) return;

		this.#sizes = new ResizeObserver(() => {
			const height = element.getBoundingClientRect().height;
			document.documentElement.style.setProperty('--dock-h', `${height}px`);
		});
		this.#sizes.observe(element);
	}

	bindBody(element: HTMLElement | null): void {
		this.#body = element;
	}

	toggle(): void {
		this.open = !this.open;
	}

	expand(): void {
		this.open = true;
	}

	collapse(): void {
		this.open = false;
	}

	/** Keeps the newest prompt in view the way a real terminal follows its output. */
	follow(): void {
		this.#scroll((body) => body.scrollHeight);
	}

	/** Back to the first prompt, once the output below it is gone. */
	rewind(): void {
		this.#scroll(() => 0);
	}

	/** A manual toggle holds until the route changes; from there the rule takes
	 *  over again. */
	syncRoute(route: TerminalRoute, submenu: TerminalSubmenu): void {
		if (route === this.#route) return;
		this.#route = route;
		this.#hasSubmenu = submenu !== null;
		this.#applyRule();
	}

	#scroll(top: (body: HTMLElement) => number): void {
		const body = this.#body;
		if (!body) return;
		requestAnimationFrame(() => {
			body.scrollTop = top(body);
		});
	}

	#setCompact(compact: boolean): void {
		this.compact = compact;
		this.#applyRule();
	}

	#applyRule(): void {
		this.open = !this.compact || this.#hasSubmenu || this.#route === 'home';
	}
}
