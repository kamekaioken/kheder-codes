export const introStorageKey = 'kheder:intro-seen';

export function markIntroSeen(): void {
	try {
		sessionStorage.setItem(introStorageKey, '1');
	} catch {
		/* session storage unavailable — the intro simply replays */
	}
}

export function introSeen(): boolean {
	try {
		return Boolean(sessionStorage.getItem(introStorageKey));
	} catch {
		return false;
	}
}

export function forgetIntro(): void {
	try {
		sessionStorage.removeItem(introStorageKey);
	} catch {
		/* nothing to forget */
	}
}
