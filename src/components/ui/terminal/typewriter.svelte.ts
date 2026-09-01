type TypewriterOptions = {
	total: number | (() => number);
	speed: number;
	onDone?: () => void;
};

/** Reveals a fixed number of steps one interval tick at a time. */
export class Typewriter {
	#total: () => number;
	#speed: number;
	#onDone?: () => void;
	#timer: ReturnType<typeof setInterval> | undefined;

	count = $state(0);

	constructor({ total, speed, onDone }: TypewriterOptions) {
		this.#total = typeof total === 'function' ? total : () => total;
		this.#speed = speed;
		this.#onDone = onDone;
	}

	get total(): number {
		return this.#total();
	}

	get done(): boolean {
		return this.count >= this.total;
	}

	start(): void {
		this.stop();
		this.#timer = setInterval(() => {
			if (this.count >= this.total) {
				this.stop();
				this.#onDone?.();
				return;
			}
			this.count += 1;
		}, this.#speed);
	}

	stop(): void {
		clearInterval(this.#timer);
		this.#timer = undefined;
	}

	finish(): void {
		this.stop();
		this.count = this.total;
	}

	reset(): void {
		this.stop();
		this.count = 0;
	}
}
