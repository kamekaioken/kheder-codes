<script lang="ts">
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

type Props = HTMLAttributes<HTMLElement> & {
	children: Snippet;
	label: string;
	as?: 'nav' | 'group';
};

const {
	children,
	label,
	as = 'nav',
	class: className,
	...rest
}: Props = $props();

const base = 'flex flex-col gap-0.5';
</script>

{#if as === 'nav'}
	<nav {...rest} class={[base, className]} aria-label={label}>
		{@render children()}
	</nav>
{:else}
	<div {...rest} class={[base, className]} role="group" aria-label={label}>
		{@render children()}
	</div>
{/if}
