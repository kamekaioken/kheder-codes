import type { LanguageOption, ThemeOption } from '../../lib/terminal';
import { applyTheme, readTheme, storeTheme, type Theme } from '../../lib/theme';
import { cycle } from '../ui/terminal/navigation';

export const settingsRows = ['language', 'theme'] as const;

export type SettingsRow = (typeof settingsRows)[number];

type SettingsInput = {
	languages: () => LanguageOption[];
	themeOptions: () => ThemeOption[];
	open: (href: string) => void;
};

/**
 * The two rows of the settings submenu. `row` is where the keyboard focus sits,
 * the cursors are where ←→ currently point, and `theme` is what was saved — three
 * separate things, which is why the submenu marks them differently.
 */
export class SettingsPanel {
	readonly rows = settingsRows;

	row = $state<SettingsRow>('language');
	theme = $state<Theme>('system');

	#input: SettingsInput;

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
			if (option && !option.active) this.#input.open(option.href);
			return;
		}
		const option = this.themeOptions[this.themeCursor];
		if (option) this.setTheme(option.value);
	}
}
