import { forgetIntro, introSeen, markIntroSeen } from '../../lib/intro';
import { Entrance } from '../ui/terminal/entrance.svelte';
import { Typewriter } from '../ui/terminal/typewriter.svelte';

const HERO_TEXT = 'KHEDER.codes';
const HERO_BREAK = 6;
const COMMAND_TEXT = 'kheder';
const REVEAL_STEP = 90;
const OUTPUT_DELAY = 260;
const WINDOW_ENTRANCE = 600;

export type TerminalPhase = 'hero' | 'term';

type BootInput = {
	intro: boolean;
	speed: number;
	rowCount: () => number;
};

/**
 * The intro choreography: the wordmark types itself, the `kheder` command is
 * echoed into the window, then the menu rows appear one by one. Each step is a
 * `Typewriter`, so the sequence can be skipped or replayed at any point.
 */
export class BootSequence {
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

	#outputTimer: ReturnType<typeof setTimeout> | undefined;

	constructor({ intro, speed, rowCount }: BootInput) {
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
		this.rows = new Typewriter({ total: rowCount, speed: REVEAL_STEP });

		if (intro) {
			this.phase = 'hero';
			this.#rewind();
		} else {
			this.#fastForward();
		}
	}

	get heroCursorLine(): 1 | 2 {
		return this.hero.count <= HERO_BREAK ? 1 : 2;
	}

	/** Types the intro, unless this visitor has already seen it this session. */
	begin(): void {
		if (this.phase === 'hero') {
			if (introSeen()) this.skip();
			else this.hero.start();
		}
		this.entrance.settle();
	}

	openTerminal(): void {
		if (this.phase !== 'hero') return;
		this.#stopTyping();
		this.phase = 'term';
		this.hero.finish();
		this.heroDone = true;
		markIntroSeen();
		this.entrance.replay();
		this.command.start();
	}

	skip(): void {
		this.#stopTyping();
		this.phase = 'term';
		this.#fastForward();
	}

	replay(): void {
		this.#stopTyping();
		forgetIntro();
		this.phase = 'hero';
		this.#rewind();
		this.hero.start();
	}

	/** The intro covers the page instead of removing it, so that its copy stays in
	 *  the document for crawlers. Everything underneath is made inert for as long
	 *  as it is covered, so the keyboard and screen readers cannot wander into it. */
	syncPhase(): void {
		document.documentElement.dataset.phase = this.phase;
		for (const covered of document.querySelectorAll('[data-shell]')) {
			(covered as HTMLElement).inert = this.phase === 'hero';
		}
	}

	dispose(): void {
		this.#stopTyping();
		this.entrance.cancel();
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

	#stopTyping(): void {
		clearTimeout(this.#outputTimer);
		this.hero.stop();
		this.command.stop();
		this.rows.stop();
	}
}
