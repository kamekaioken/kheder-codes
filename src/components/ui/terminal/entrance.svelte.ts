/**
 * Plays an entry animation exactly once. Astro restarts CSS animations on
 * persisted islands during a view transition, so the animation class is dropped
 * as soon as it has played and only put back when the element really is new.
 */
export class Entrance {
	#duration: number;
	#timer: ReturnType<typeof setTimeout> | undefined;

	active = $state(true);

	constructor(duration: number) {
		this.#duration = duration;
	}

	/** Drops the class once the animation is over. Call this on mount. */
	settle(): () => void {
		this.#schedule();
		return () => clearTimeout(this.#timer);
	}

	replay(): void {
		this.active = true;
		this.#schedule();
	}

	#schedule(): void {
		clearTimeout(this.#timer);
		this.#timer = setTimeout(() => {
			this.active = false;
		}, this.#duration);
	}
}
