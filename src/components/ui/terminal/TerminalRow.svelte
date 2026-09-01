<script lang="ts">
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import TerminalMarker from './TerminalMarker.svelte';

type Props = HTMLAttributes<HTMLElement> & {
	children: Snippet;
	href?: string;
	target?: string;
	rel?: string;
	selected?: boolean;
	highlight?: boolean;
	revealed?: boolean;
	onselect?: () => void;
};

const {
	children,
	selected = false,
	highlight = true,
	revealed = true,
	onselect,
	href,
	class: className,
	...rest
}: Props = $props();

const base =
	'-mx-3 flex items-baseline gap-3 rounded-[7px] px-3 py-[5px] no-underline transition-colors duration-150 hover:bg-row-hover hover:no-underline';

const classes = $derived([
	base,
	selected && highlight && 'row-selected',
	className,
]);

function handleClick(event: MouseEvent) {
	if (!onselect) return;
	event.preventDefault();
	onselect();
}
</script>

{#snippet row()}
	<TerminalMarker active={selected} />
	{@render children()}
{/snippet}

{#if href}
	<a
		{...rest}
		{href}
		class={classes}
		style:opacity={revealed ? 1 : 0}
		onclick={handleClick}
	>
		{@render row()}
	</a>
{:else}
	<div {...rest} class={classes} style:opacity={revealed ? 1 : 0}>
		{@render row()}
	</div>
{/if}
