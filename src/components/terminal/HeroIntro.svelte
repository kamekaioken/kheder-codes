<script lang="ts">
import HeroWordmark from './HeroWordmark.svelte';
import { getSession } from './session.svelte';

const session = getSession();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	data-hero
	data-testid="hero"
	class="flex min-h-screen cursor-pointer flex-col items-center justify-center p-6 select-none"
	onclick={() => session.startTerminal()}
>
	<HeroWordmark />

	<div
		class="mt-14 animate-fade-up-slow"
		data-hero-hint
		data-typed={session.heroDone}
	>
		<button
			type="button"
			class="flex cursor-pointer items-center gap-2.5 text-sm text-dim"
			data-testid="hero-enter"
			onclick={() => session.startTerminal()}
		>
			<span
				class="rounded-md border border-line px-[9px] py-[3px] text-xs shadow-key"
				>{session.labels.heroKey}</span
			>
			<span>{session.labels.heroHint}</span>
		</button>
	</div>
</div>
