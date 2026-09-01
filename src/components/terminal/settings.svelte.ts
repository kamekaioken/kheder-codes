import type {
	LanguageOption,
	TerminalRoute,
	ThemeOption,
} from '../../lib/terminal';
import { applyTheme, readTheme, storeTheme, type Theme } from '../../lib/theme';
import { cycle } from '../ui/terminal/navigation';

export const settingsRows = ['language', 'theme'] as const;

export type SettingsRow = (typeof settingsRows)[number];

type SettingsInput = {
	languages: () => LanguageOption[];
	themeOptions: () => ThemeOption[];
	navigate: (href: string) => void;
};

/**
 * The two rows of the settings submenu. `row` is where the keyboard focus sits,
 * the cursors are where ←→ currently point, and `theme` is what was saved — three
 * separate things, which is why the submenu marks them differently.
 *
 * Settings has no page of its own: `expanded` unfolds the panel over whatever is
 * being read and folds away again on ⎋ or on the next page.
 */
export class SettingsPanel {
	readonly rows = settingsRows;

	expanded = $state(false);
	row = $state<SettingsRow>('language');
	theme = $state<Theme>('system');

	#input: SettingsInput;
	#route: TerminalRoute | null = null;

	constructor(input: SettingsInput) {
		this.#input = input;
	}

	get languages(): LanguageOption[] {
		return this.#input.languages();
	}

	get themeOptions(): ThemeOption[] {
		return this.#input.themeOptions();
	}

	readonly #activeLanguage = $derived(
		Math.max(
			0,
			this.languages.findIndex((option) => option.active),
		),
	);

	readonly #activeTheme = $derived(
		Math.max(
			0,
			this.themeOptions.findIndex((option) => option.value === this.theme),
		),
	);

	langCursor = $derived(this.#activeLanguage);
	themeCursor = $derived(this.#activeTheme);

	load(): void {
		this.theme = readTheme();
	}

	expand(): void {
		this.expanded = true;
	}

	collapse(): void {
		this.expanded = false;
	}

	/** Reading on is leaving the settings behind. Switching language keeps the
	 *  route it was opened from, so there the panel stays where it was. */
	syncRoute(route: TerminalRoute): void {
		if (route === this.#route) return;
		this.#route = route;
		this.expanded = false;
	}

	moveRow(delta: number): void {
		const next = cycle(
			settingsRows.indexOf(this.row),
			delta,
			settingsRows.length,
		);
		this.row = settingsRows[next] ?? this.row;
	}

	focusRow(index: number): void {
		this.row = settingsRows[index] ?? this.row;
	}

	moveCursor(delta: number): void {
		if (this.row === 'language') {
			this.langCursor = cycle(this.langCursor, delta, this.languages.length);
			return;
		}
		this.themeCursor = cycle(this.themeCursor, delta, this.themeOptions.length);
	}

	setTheme(theme: Theme): void {
		this.theme = theme;
		storeTheme(theme);
		applyTheme(theme);
	}

	apply(): void {
		if (this.row === 'language') {
			const option = this.languages[this.langCursor];
			if (option && !option.active) this.#input.navigate(option.href);
			return;
		}
		const option = this.themeOptions[this.themeCursor];
		if (option) this.setTheme(option.value);
	}
}
