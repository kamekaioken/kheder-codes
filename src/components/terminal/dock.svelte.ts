import type { TerminalRoute, TerminalSubmenu } from '../../lib/terminal';

/** Keep this in step with the dock's own media query in `global.css`. */
const SIDE_QUERY = '(min-width: 1080px)';
const COMPACT_QUERY = '(max-width: 767px)';

/**
 * Where the terminal sits and whether it is unfolded. With room for a column of
 * its own it stands on the left of the page and covers nothing — `side` — so it
 * offers no way to fold it away. Below that it lies along the bottom edge over
 * the content, where it can be folded to its title bar; on a phone it folds
 * itself, staying open only where the menu is still the point — the home screen
 * and the submenus — so a content page is read against the title bar alone.
 *
 * Its measured height is published as `--dock-h`, which is the room the page
 * keeps free underneath the content while it lies at the bottom.
 */
export class TerminalDock {
	open = $state(true);
	side = $state(false);
	compact = $state(false);

	#body: HTMLElement | null = null;
	#sizes: ResizeObserver | undefined;
	#route: TerminalRoute | null = null;
	#hasSubmenu = false;

	attach(): () => void {
		const side = window.matchMedia(SIDE_QUERY);
		const compact = window.matchMedia(COMPACT_QUERY);
		const onChange = () => {
			this.side = side.matches;
			this.compact = compact.matches;
			this.#applyRule();
		};

		onChange();
		side.addEventListener('change', onChange);
		compact.addEventListener('change', onChange);

		return () => {
			side.removeEventListener('change', onChange);
			compact.removeEventListener('change', onChange);
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

	#applyRule(): void {
		this.open = !this.compact || this.#hasSubmenu || this.#route === 'home';
	}
}
