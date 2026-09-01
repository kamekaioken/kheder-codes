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
	class="flex min-h-dvh cursor-pointer flex-col items-center justify-center bg-page p-6 select-none"
	onclick={() => session.boot.openTerminal()}
>
	<HeroWordmark />

	<div
		class="mt-14 animate-fade-up-slow"
		data-hero-hint
		data-typed={session.boot.heroDone}
	>
		<button
			type="button"
			class="flex cursor-pointer items-center gap-2.5 text-sm text-dim"
			data-testid="hero-enter"
			onclick={() => session.boot.openTerminal()}
		>
			<span
				class="rounded-md border border-line px-[9px] py-[3px] text-xs shadow-key"
				>{session.labels.heroKey}</span
			>
			<span>{session.labels.heroHint}</span>
		</button>
	</div>
</div>
