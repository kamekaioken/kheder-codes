<script lang="ts">
import type { HTMLAttributes } from 'svelte/elements';

type Props = HTMLAttributes<HTMLElement> & {
	label: string;
	href?: string;
	hreflang?: string;
	checked?: boolean;
	focused?: boolean;
	onselect?: () => void;
};

const {
	label,
	checked = false,
	focused = false,
	onselect,
	href,
	class: className,
	...rest
}: Props = $props();

const base =
	'inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-2 py-0.5 text-[13px] no-underline transition-colors duration-150 hover:bg-row-hover hover:no-underline';

const classes = $derived([
	base,
	focused ? 'row-selected border-accent' : 'border-transparent',
	checked || focused ? 'text-fg' : 'text-dim',
	className,
]);
</script>

{#snippet choice()}
	<span class="text-accent" aria-hidden="true">{checked ? '(•)' : '( )'}</span>
	<span class={checked ? 'font-bold' : undefined}>{label}</span>
{/snippet}

{#if href}
	<a {...rest} {href} class={classes} onclick={onselect}>
		{@render choice()}
	</a>
{:else}
	<button {...rest} type="button" class={classes} onclick={onselect}>
		{@render choice()}
	</button>
{/if}
