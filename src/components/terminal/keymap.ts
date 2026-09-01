import { cycle, digitIndex } from '../ui/terminal/navigation';
import type { TerminalSession } from './session.svelte';

function isTypingTarget(target: HTMLElement | null): boolean {
	return Boolean(
		target?.closest('input, textarea, select, [contenteditable="true"]'),
	);
}

function step(key: string): -1 | 1 | 0 {
	if (key === 'ArrowDown' || key === 'ArrowRight') return 1;
	if (key === 'ArrowUp' || key === 'ArrowLeft') return -1;
	return 0;
}

function handleMenu(
	session: TerminalSession,
	event: KeyboardEvent,
	onControl: boolean,
): void {
	const length = session.items.length;

	if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
		event.preventDefault();
		session.selected = cycle(session.selected, step(event.key), length);
		return;
	}
	if (event.key === 'Enter' && !onControl) {
		event.preventDefault();
		session.open(session.selected);
		return;
	}
	const index = digitIndex(event.key, length);
	if (index !== null) session.open(index);
}

function handleBlog(
	session: TerminalSession,
	event: KeyboardEvent,
	onControl: boolean,
): void {
	const length = session.posts.length;

	if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
		event.preventDefault();
		session.postSelected = cycle(session.postSelected, step(event.key), length);
		return;
	}
	if (event.key === 'Enter' && !onControl) {
		event.preventDefault();
		session.openPost(session.postSelected);
		return;
	}
	const index = digitIndex(event.key, length);
	if (index !== null) session.openPost(index);
}

function handleSettings(
	session: TerminalSession,
	event: KeyboardEvent,
	onControl: boolean,
): void {
	const settings = session.settings;

	if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
		event.preventDefault();
		settings.moveRow(step(event.key));
		return;
	}
	if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
		event.preventDefault();
		settings.moveCursor(step(event.key));
		return;
	}
	if (event.key === 'Enter' && !onControl) {
		event.preventDefault();
		settings.apply();
		return;
	}
	const index = digitIndex(event.key, settings.rows.length);
	if (index !== null) settings.focusRow(index);
}

/** Maps a keystroke onto the session. Rows count from 1, ⎋ always goes back. */
export function handleTerminalKey(
	session: TerminalSession,
	event: KeyboardEvent,
): void {
	if (event.metaKey || event.ctrlKey || event.altKey) return;

	const target = event.target as HTMLElement | null;
	if (isTypingTarget(target)) return;

	/* Enter and Space belong to the focused link or button, not to the menu. */
	const onControl = Boolean(target?.closest('a, button'));

	if (session.boot.phase === 'hero') {
		if (event.key === 'Enter' || event.key === ' ') {
			if (onControl) return;
			event.preventDefault();
			session.boot.openTerminal();
		}
		return;
	}

	if (event.key === 'Escape') {
		event.preventDefault();
		session.goBack();
		return;
	}

	if (!session.boot.menuOn) return;

	if (session.submenu === 'blog') handleBlog(session, event, onControl);
	else if (session.submenu === 'settings')
		handleSettings(session, event, onControl);
	else handleMenu(session, event, onControl);
}
