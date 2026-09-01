<script lang="ts">
import { navigate } from 'astro:transitions/client';
import { onMount, untrack } from 'svelte';
import {
	introStorageKey,
	readTheme,
	storeTheme,
	type Theme,
} from '../lib/theme';

type MenuItem = {
	id: string;
	name: string;
	desc: string;
	href: string;
	external: boolean;
	submenu: 'blog' | 'settings' | null;
};

type Post = { file: string; title: string; href: string };
type LanguageOption = {
	locale: string;
	name: string;
	href: string;
	active: boolean;
};
type ThemeOption = { value: Theme; name: string };

type Props = {
	items: MenuItem[];
	posts: Post[];
	languages: LanguageOption[];
	themeOptions: ThemeOption[];
	current: string;
	currentPostFile?: string | null;
	showIntro?: boolean;
	homeHref: string;
	blogHref: string;
	typingSpeed?: number;
	labels: {
		heroKey: string;
		heroHint: string;
		closeTitle: string;
		titleHome: string;
		titleBlog: string;
		titleSettings: string;
		version: string;
		choose: string;
		navLabel: string;
		hintMain: string;
		hintBlog: string;
		hintSettings: string;
		blogCmd: string;
		blogCount: string;
		blogNavLabel: string;
		wip: string;
		settingsCmd: string;
		settingsIntro: string;
		settingsLabel: string;
		rowLanguage: string;
		rowTheme: string;
	};
};

const {
	items,
	posts,
	languages,
	themeOptions,
	current,
	currentPostFile = null,
	showIntro = false,
	homeHref,
	blogHref,
	typingSpeed = 70,
	labels,
}: Props = $props();

const HERO = 'KHEDER.codes';
const HERO_BREAK = 6;
const CMD = 'kheder';
const REVEAL_STEP = 90;
const SETTINGS_ROWS = 2;
const OUTPUT_DELAY = 260;

const SETTINGS_VALUE =
	'cursor-pointer rounded-md border border-transparent px-2 py-0.5 text-[13px] text-dim no-underline transition-colors duration-150 hover:bg-row-hover hover:text-fg hover:no-underline';

const heroChars = HERO.split('');
const cmdChars = CMD.split('');

const startsWithIntro = untrack(() => showIntro);
const initialItemCount = untrack(() => items.length);

let phase = $state<'hero' | 'term'>(startsWithIntro ? 'hero' : 'term');
let heroN = $state(startsWithIntro ? 0 : HERO.length);
let heroDone = $state(!startsWithIntro);
let cmdN = $state(startsWithIntro ? 0 : CMD.length);
let menuOn = $state(!startsWithIntro);
let revealN = $state(startsWithIntro ? 0 : initialItemCount);
let settingsRow = $state(0);
let theme = $state<Theme>('system');

const submenu = $derived(
	current === 'blog' || current === 'post'
		? 'blog'
		: current === 'settings'
			? 'settings'
			: null,
);

const activeItemId = $derived(current === 'post' ? 'blog' : current);
const currentIndex = $derived(
	Math.max(
		0,
		items.findIndex((item) => item.id === activeItemId),
	),
);
const currentPostIndex = $derived(
	Math.max(
		0,
		posts.findIndex((post) => post.file === currentPostFile),
	),
);
const activeThemeIndex = $derived(
	Math.max(
		0,
		themeOptions.findIndex((option) => option.value === theme),
	),
);
const activeLangIndex = $derived(
	Math.max(
		0,
		languages.findIndex((option) => option.active),
	),
);

let sel = $derived(currentIndex);
let subSel = $derived(currentPostIndex);
let langCursor = $derived(activeLangIndex);
let themeCursor = $derived(activeThemeIndex);

const termTitle = $derived(
	submenu === 'blog'
		? labels.titleBlog
		: submenu === 'settings'
			? labels.titleSettings
			: labels.titleHome,
);
const hintLine = $derived(
	submenu === 'blog'
		? labels.hintBlog
		: submenu === 'settings'
			? labels.hintSettings
			: labels.hintMain,
);
const heroCursorLine = $derived(heroN <= HERO_BREAK ? 1 : 2);

let heroTimer: ReturnType<typeof setInterval> | undefined;
let cmdTimer: ReturnType<typeof setInterval> | undefined;
let revealTimer: ReturnType<typeof setInterval> | undefined;
let outputTimer: ReturnType<typeof setTimeout> | undefined;

function clearTimers() {
	clearInterval(heroTimer);
	clearInterval(cmdTimer);
	clearInterval(revealTimer);
	clearTimeout(outputTimer);
}

function markIntroSeen() {
	try {
		sessionStorage.setItem(introStorageKey, '1');
	} catch {
		/* session storage unavailable — intro simply replays */
	}
}

function introSeen() {
	try {
		return Boolean(sessionStorage.getItem(introStorageKey));
	} catch {
		return false;
	}
}

function forgetIntro() {
	try {
		sessionStorage.removeItem(introStorageKey);
	} catch {
		/* nothing to forget */
	}
}

function startHeroTyping() {
	clearInterval(heroTimer);
	heroTimer = setInterval(() => {
		if (heroN >= HERO.length) {
			clearInterval(heroTimer);
			heroDone = true;
			markIntroSeen();
			return;
		}
		heroN += 1;
	}, typingSpeed);
}

function startReveal() {
	menuOn = true;
	clearInterval(revealTimer);
	revealTimer = setInterval(() => {
		if (revealN >= items.length) {
			clearInterval(revealTimer);
			return;
		}
		revealN += 1;
	}, REVEAL_STEP);
}

function startTerminal() {
	if (phase !== 'hero') return;
	clearTimers();
	phase = 'term';
	heroN = HERO.length;
	heroDone = true;
	markIntroSeen();
	cmdTimer = setInterval(() => {
		if (cmdN >= CMD.length) {
			clearInterval(cmdTimer);
			outputTimer = setTimeout(startReveal, OUTPUT_DELAY);
			return;
		}
		cmdN += 1;
	}, typingSpeed + 20);
}

function openTerminalInstantly() {
	clearTimers();
	phase = 'term';
	heroN = HERO.length;
	heroDone = true;
	cmdN = CMD.length;
	menuOn = true;
	revealN = items.length;
}

function resetToHero() {
	clearTimers();
	forgetIntro();
	phase = 'hero';
	heroN = 0;
	heroDone = false;
	cmdN = 0;
	menuOn = false;
	revealN = 0;
	window.scrollTo({ top: 0 });
	if (current !== 'home') navigate(homeHref);
	startHeroTyping();
}

function go(href: string) {
	if (window.scrollY > 0) window.scrollTo({ top: 0, behavior: 'smooth' });
	navigate(href);
}

function goBack() {
	if (current === 'post') go(blogHref);
	else if (current !== 'home') go(homeHref);
	else resetToHero();
}

function open(index: number) {
	const item = items[index];
	if (!item) return;
	sel = index;
	if (item.external) {
		window.open(item.href, '_blank', 'noopener');
		return;
	}
	go(item.href);
}

function openPost(index: number) {
	const post = posts[index];
	if (!post) return;
	subSel = index;
	go(post.href);
}

function setTheme(next: Theme) {
	theme = next;
	storeTheme(next);
	const root = document.documentElement;
	if (next === 'system') root.removeAttribute('data-theme');
	else root.setAttribute('data-theme', next);
}

function applySettingsRow() {
	if (settingsRow === 0) {
		const option = languages[langCursor];
		if (option && !option.active) go(option.href);
		return;
	}
	const option = themeOptions[themeCursor];
	if (option) setTheme(option.value);
}

function moveValueCursor(delta: number) {
	if (settingsRow === 0) {
		langCursor = (langCursor + delta + languages.length) % languages.length;
		return;
	}
	themeCursor =
		(themeCursor + delta + themeOptions.length) % themeOptions.length;
}

function handleKey(event: KeyboardEvent) {
	if (event.metaKey || event.ctrlKey || event.altKey) return;

	const target = event.target as HTMLElement | null;
	if (target?.closest('input, textarea, select, [contenteditable="true"]'))
		return;
	const onControl = Boolean(target?.closest('a, button'));

	if (phase === 'hero') {
		if (event.key === 'Enter' || event.key === ' ') {
			if (onControl) return;
			event.preventDefault();
			startTerminal();
		}
		return;
	}

	if (event.key === 'Escape') {
		event.preventDefault();
		goBack();
		return;
	}

	if (!menuOn) return;

	if (submenu === 'blog') {
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			subSel = (subSel + 1) % posts.length;
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			subSel = (subSel - 1 + posts.length) % posts.length;
		} else if (event.key === 'Enter' && !onControl) {
			event.preventDefault();
			openPost(subSel);
		} else if (/^[1-9]$/.test(event.key) && Number(event.key) <= posts.length) {
			openPost(Number(event.key) - 1);
		}
		return;
	}

	if (submenu === 'settings') {
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			settingsRow = (settingsRow + 1) % SETTINGS_ROWS;
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			settingsRow = (settingsRow - 1 + SETTINGS_ROWS) % SETTINGS_ROWS;
		} else if (event.key === 'ArrowRight') {
			event.preventDefault();
			moveValueCursor(1);
		} else if (event.key === 'ArrowLeft') {
			event.preventDefault();
			moveValueCursor(-1);
		} else if (event.key === 'Enter' && !onControl) {
			event.preventDefault();
			applySettingsRow();
		} else if (
			/^[1-9]$/.test(event.key) &&
			Number(event.key) <= SETTINGS_ROWS
		) {
			settingsRow = Number(event.key) - 1;
		}
		return;
	}

	if (event.key === 'ArrowDown') {
		event.preventDefault();
		sel = (sel + 1) % items.length;
	} else if (event.key === 'ArrowUp') {
		event.preventDefault();
		sel = (sel - 1 + items.length) % items.length;
	} else if (event.key === 'Enter' && !onControl) {
		event.preventDefault();
		open(sel);
	} else if (/^[1-9]$/.test(event.key) && Number(event.key) <= items.length) {
		open(Number(event.key) - 1);
	}
}

onMount(() => {
	theme = readTheme();

	if (phase === 'hero') {
		if (introSeen()) openTerminalInstantly();
		else startHeroTyping();
	}

	const onScroll = () => {
		if (phase === 'hero') startTerminal();
	};
	const syncPhase = () => {
		document.documentElement.dataset.phase = phase;
	};

	window.addEventListener('keydown', handleKey);
	window.addEventListener('wheel', onScroll, { passive: true });
	window.addEventListener('touchmove', onScroll, { passive: true });
	document.addEventListener('astro:after-swap', syncPhase);

	return () => {
		clearTimers();
		window.removeEventListener('keydown', handleKey);
		window.removeEventListener('wheel', onScroll);
		window.removeEventListener('touchmove', onScroll);
		document.removeEventListener('astro:after-swap', syncPhase);
	};
});

$effect(() => {
	document.documentElement.dataset.phase = phase;
});
</script>

{#if showIntro}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		data-hero
		data-testid="hero"
		class="flex min-h-screen cursor-pointer flex-col items-center justify-center p-6 select-none"
		onclick={startTerminal}
	>
		<h1
			class="font-display text-center leading-[.95] font-extrabold tracking-[-0.02em]"
			data-testid="wordmark"
		>
			<span class="block text-hero-1">
				{#each heroChars.slice(0, HERO_BREAK) as char, index (index)}<span
						class="hero-char"
						data-typed={index < heroN}>{char}</span
					>{/each}{#if phase === 'hero' && heroCursorLine === 1}<span
					class="ml-[.06em] inline-block h-[.82em] w-[.55em] translate-y-[.08em] bg-fg align-baseline animate-blink"
					aria-hidden="true"
				></span>{/if}
			</span>
			<span class="mt-[.1em] block text-right text-hero-2">
				{#each heroChars.slice(HERO_BREAK) as char, index (index)}<span
						class="hero-char"
						data-typed={index + HERO_BREAK < heroN}>{char}</span
					>{/each}{#if phase === 'hero' && heroCursorLine === 2}<span
					class="ml-[.06em] inline-block h-[.82em] w-[.55em] translate-y-[.08em] bg-fg animate-blink"
					aria-hidden="true"
				></span>{/if}
			</span>
		</h1>

		<div class="mt-14 animate-fade-up-slow" data-hero-hint data-typed={heroDone}>
			<button
				type="button"
				class="flex cursor-pointer items-center gap-2.5 text-sm text-dim"
				data-testid="hero-enter"
				onclick={startTerminal}
			>
				<span class="rounded-md border border-line px-[9px] py-[3px] text-xs shadow-key"
					>{labels.heroKey}</span
				>
				<span>{labels.heroHint}</span>
			</button>
		</div>
	</div>
{/if}

<div
	data-terminal
	data-testid="terminal"
	class="mx-auto box-border w-full max-w-[840px] px-4 pt-[clamp(20px,5vh,56px)] animate-fade-up"
>
	<div class="overflow-hidden rounded-xl border border-line bg-term shadow-term">
		<div
			class="relative flex h-10 items-center border-b border-line bg-linear-to-b from-chrome to-chrome-2 px-3.5"
		>
			<div class="flex gap-2">
				<button
					type="button"
					class="block size-3 cursor-pointer rounded-full bg-tl-red hover:shadow-tl-red"
					title={labels.closeTitle}
					aria-label={labels.closeTitle}
					onclick={resetToHero}
				></button>
				<span class="block size-3 rounded-full bg-tl-yellow"></span>
				<span class="block size-3 rounded-full bg-tl-green"></span>
			</div>
			<div
				class="pointer-events-none absolute inset-x-0 text-center text-[13px] text-dim"
				data-testid="term-title"
			>
				{termTitle}
			</div>
		</div>

		<div class="px-[22px] pt-5 pb-6 text-sm leading-[1.9]">
			<div>
				<span class="text-accent">kheder@mbp</span> <span class="text-dim">~ %</span>
				{#each cmdChars as char, index (index)}<span class="hero-char" data-typed={index < cmdN}
						>{char}</span
					>{/each}{#if phase === 'term' && !menuOn}<span
					class="inline-block h-4 w-2 bg-fg align-middle animate-blink"
					aria-hidden="true"
				></span>{/if}
			</div>

			<div data-menu data-typed={menuOn}>
				<div
					class="transition-opacity duration-250"
					style:opacity={submenu ? 0.4 : 1}
					data-testid="main-menu"
				>
					<div class="mt-2.5 mb-1 text-dim">
						{labels.version}<br />{labels.choose}
					</div>
					<nav class="mt-2 mb-1 flex flex-col gap-0.5" aria-label={labels.navLabel}>
						{#each items as item, index (item.id)}
							<a
								href={item.href}
								target={item.external ? '_blank' : null}
								rel={item.external ? 'noopener' : null}
								aria-current={item.id === activeItemId ? 'page' : null}
								data-testid={`menu-${item.id}`}
								class="-mx-3 flex items-baseline gap-3 rounded-[7px] px-3 py-[5px] no-underline transition-colors duration-150 hover:bg-row-hover hover:no-underline"
								class:row-selected={!submenu && index === sel}
								style:opacity={index < revealN ? 1 : 0}
								onclick={(event) => {
									if (item.external) return;
									event.preventDefault();
									open(index);
								}}
							>
								<span class="w-3.5 flex-none text-accent" aria-hidden="true"
									>{!submenu && index === sel ? '❯' : ''}</span
								>
								<span class="min-w-[118px] flex-none font-bold text-fg">{item.name}</span>
								<span class="text-[13px] text-dim">{item.desc}</span>
							</a>
						{/each}
					</nav>
				</div>

				{#if submenu === 'blog'}
					<div class="mt-2.5 animate-fade-in" data-testid="blog-submenu">
						<div>
							<span class="text-accent">kheder@mbp</span> <span class="text-dim">~ %</span> kheder
							{labels.blogCmd}
						</div>
						<div class="mt-1.5 mb-0.5 text-dim">{labels.blogCount}</div>
						<nav class="mt-1.5 mb-1 flex flex-col gap-0.5" aria-label={labels.blogNavLabel}>
							{#each posts as post, index (post.file)}
								<a
									href={post.href}
									aria-current={post.file === currentPostFile ? 'page' : null}
									data-testid={`post-${index + 1}`}
									class="-mx-3 flex items-baseline gap-3 rounded-[7px] px-3 py-[5px] text-fg no-underline transition-colors duration-150 hover:bg-row-hover hover:no-underline"
									class:row-selected={index === subSel}
									onclick={(event) => {
										event.preventDefault();
										openPost(index);
									}}
								>
									<span class="w-3.5 flex-none text-accent" aria-hidden="true"
										>{index === subSel ? '❯' : ''}</span
									>
									<span class="flex-none">{post.file}</span>
									<span class="ml-auto flex-none text-xs text-dim">{labels.wip}</span>
								</a>
							{/each}
						</nav>
					</div>
				{/if}

				{#if submenu === 'settings'}
					<div class="mt-2.5 animate-fade-in" data-testid="settings-submenu">
						<div>
							<span class="text-accent">kheder@mbp</span> <span class="text-dim">~ %</span> kheder
							{labels.settingsCmd}
						</div>
						<div class="mt-1.5 mb-0.5 text-dim">{labels.settingsIntro}</div>
						<div
							class="mt-1.5 mb-1 flex flex-col gap-0.5"
							role="group"
							aria-label={labels.settingsLabel}
						>
							<div
								class="-mx-3 flex flex-wrap items-baseline gap-3 rounded-[7px] px-3 py-[5px]"
								role="group"
								aria-labelledby="settings-row-language"
								data-testid="settings-language"
							>
								<span class="w-3.5 flex-none text-accent" aria-hidden="true"
									>{settingsRow === 0 ? '❯' : ''}</span
								>
								<span id="settings-row-language" class="min-w-[118px] flex-none font-bold"
									>{labels.rowLanguage}</span
								>
								<span class="flex flex-wrap gap-2">
									{#each languages as option, index (option.locale)}
										<a
											href={option.href}
											hreflang={option.locale}
											aria-current={option.active ? 'true' : null}
											data-testid={`lang-${option.locale}`}
											class={[
												SETTINGS_VALUE,
												option.active && 'row-selected font-bold text-fg',
												settingsRow === 0 && langCursor === index && 'border-dashed border-accent',
											]}
											onclick={() => {
												settingsRow = 0;
												langCursor = index;
											}}>{option.name}</a
										>
									{/each}
								</span>
							</div>

							<div
								class="-mx-3 flex flex-wrap items-baseline gap-3 rounded-[7px] px-3 py-[5px]"
								role="group"
								aria-labelledby="settings-row-theme"
								data-testid="settings-theme"
							>
								<span class="w-3.5 flex-none text-accent" aria-hidden="true"
									>{settingsRow === 1 ? '❯' : ''}</span
								>
								<span id="settings-row-theme" class="min-w-[118px] flex-none font-bold"
									>{labels.rowTheme}</span
								>
								<span class="flex flex-wrap gap-2">
									{#each themeOptions as option, index (option.value)}
										<button
											type="button"
											aria-pressed={theme === option.value}
											data-testid={`theme-${option.value}`}
											class={[
												SETTINGS_VALUE,
												theme === option.value && 'row-selected font-bold text-fg',
												settingsRow === 1 && themeCursor === index && 'border-dashed border-accent',
											]}
											onclick={() => {
												settingsRow = 1;
												themeCursor = index;
												setTheme(option.value);
											}}>{option.name}</button
										>
									{/each}
								</span>
							</div>
						</div>
					</div>
				{/if}

				<div
					class="mt-3 border-t border-dashed border-line pt-2.5 text-xs text-dim"
					data-testid="hint-line"
				>
					{hintLine}
				</div>
			</div>
		</div>
	</div>
</div>

