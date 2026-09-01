<script lang="ts">
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

type Props = HTMLAttributes<HTMLDivElement> & {
	children: Snippet;
	controls?: Snippet;
	actions?: Snippet;
};

const {
	children,
	controls,
	actions,
	class: className,
	...rest
}: Props = $props();
</script>

<div
	{...rest}
	class={[
		'relative flex h-10 items-center border-b border-line bg-linear-to-b from-chrome to-chrome-2 px-3.5',
		className,
	]}
>
	{#if controls}
		<div class="flex gap-2">{@render controls()}</div>
	{/if}
	<div
		class="pointer-events-none absolute inset-x-0 text-center text-[13px] text-dim"
	>
		{@render children()}
	</div>
	{#if actions}
		<div class="relative ml-auto flex items-center">{@render actions()}</div>
	{/if}
</div>
