import { cycle, digitIndex } from '../ui/terminal/navigation';
import type { TerminalSession } from './session.svelte';

/** The main menu and the blog and legal submenus are all lists of links, and
 *  behave identically under the keyboard. */
type LinkList = {
	length: number;
	selected: number;
	select: (index: number) => void;
	open: (index: number) => void;
};

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

function menuList(session: TerminalSession): LinkList {
	return {
		length: session.items.length,
		selected: session.selected,
		select: (index) => {
			session.selected = index;
		},
		open: (index) => session.open(index),
	};
}

function postList(session: TerminalSession): LinkList {
	return {
		length: session.posts.length,
		selected: session.postSelected,
		select: (index) => {
			session.postSelected = index;
		},
		open: (index) => session.openPost(index),
	};
}

function legalList(session: TerminalSession): LinkList {
	return {
		length: session.legalDocs.length,
		selected: session.legalSelected,
		select: (index) => {
			session.legalSelected = index;
		},
		open: (index) => session.openLegal(index),
	};
}

function handleLinkList(
	list: LinkList,
	event: KeyboardEvent,
	onControl: boolean,
): void {
	if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
		event.preventDefault();
		list.select(cycle(list.selected, step(event.key), list.length));
		return;
	}
	if (event.key === 'Enter' && !onControl) {
		event.preventDefault();
		list.open(list.selected);
		return;
	}
	const index = digitIndex(event.key, list.length);
	if (index !== null) list.open(index);
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

	if (session.submenu === 'settings') handleSettings(session, event, onControl);
	else if (session.submenu === 'blog')
		handleLinkList(postList(session), event, onControl);
	else if (session.submenu === 'legal')
		handleLinkList(legalList(session), event, onControl);
	else handleLinkList(menuList(session), event, onControl);
}
