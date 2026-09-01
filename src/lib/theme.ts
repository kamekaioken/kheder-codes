export const themes = ['system', 'light', 'dark'] as const;

export type Theme = (typeof themes)[number];

export const themeStorageKey = 'kheder:theme';

export const introStorageKey = 'kheder:intro-seen';

export function isTheme(value: string | null): value is Theme {
	return value !== null && (themes as readonly string[]).includes(value);
}

export function applyTheme(theme: Theme): void {
	const root = document.documentElement;
	if (theme === 'system') {
		root.removeAttribute('data-theme');
	} else {
		root.setAttribute('data-theme', theme);
	}
}

export function readTheme(): Theme {
	try {
		const stored = localStorage.getItem(themeStorageKey);
		return isTheme(stored) ? stored : 'system';
	} catch {
		return 'system';
	}
}

export function storeTheme(theme: Theme): void {
	try {
		if (theme === 'system') {
			localStorage.removeItem(themeStorageKey);
		} else {
			localStorage.setItem(themeStorageKey, theme);
		}
	} catch {
		/* storage unavailable — theme stays for this page only */
	}
}
