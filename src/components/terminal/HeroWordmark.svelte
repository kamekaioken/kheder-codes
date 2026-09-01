<script lang="ts">
import TerminalCursor from '../ui/terminal/TerminalCursor.svelte';
import TerminalTypedText from '../ui/terminal/TerminalTypedText.svelte';
import { getSession } from './session.svelte';

const session = getSession();

const firstLine = $derived(session.heroText.slice(0, session.heroBreak));
const secondLine = $derived(session.heroText.slice(session.heroBreak));
const typing = $derived(session.phase === 'hero');
</script>

<h1
	class="font-display text-center leading-[.95] font-extrabold tracking-[-0.02em]"
	data-testid="wordmark"
>
	<span class="block text-hero-1"
		><TerminalTypedText
			text={firstLine}
			typed={session.hero.count}
		/>{#if typing && session.heroCursorLine === 1}<TerminalCursor
				variant="text"
			/>{/if}</span
	>
	<span class="mt-[.1em] block text-right text-hero-2"
		><TerminalTypedText
			text={secondLine}
			offset={session.heroBreak}
			typed={session.hero.count}
		/>{#if typing && session.heroCursorLine === 2}<TerminalCursor
				variant="text"
			/>{/if}</span
	>
</h1>
