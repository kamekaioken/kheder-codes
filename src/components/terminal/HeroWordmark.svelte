<script lang="ts">
import TerminalCursor from '../ui/terminal/TerminalCursor.svelte';
import TerminalTypedText from '../ui/terminal/TerminalTypedText.svelte';
import { getSession } from './session.svelte';

const { boot } = getSession();

const firstLine = $derived(boot.heroText.slice(0, boot.heroBreak));
const secondLine = $derived(boot.heroText.slice(boot.heroBreak));
const typing = $derived(boot.phase === 'hero');
</script>

<p
	class="font-display text-center leading-[.95] font-extrabold tracking-[-0.02em]"
	data-testid="wordmark"
>
	<span class="block text-hero-1"
		><TerminalTypedText
			text={firstLine}
			typed={boot.hero.count}
		/>{#if typing && boot.heroCursorLine === 1}<TerminalCursor
				variant="text"
			/>{/if}</span
	>
	<span class="mt-[.1em] block text-right text-hero-2"
		><TerminalTypedText
			text={secondLine}
			offset={boot.heroBreak}
			typed={boot.hero.count}
		/>{#if typing && boot.heroCursorLine === 2}<TerminalCursor
				variant="text"
			/>{/if}</span
	>
</p>
