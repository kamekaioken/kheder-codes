<script lang="ts">
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

type Props = HTMLAttributes<HTMLDivElement> & {
	children: Snippet;
	/** A window sitting on an edge loses the corners and shadow on that side. */
	docked?: boolean;
};

const { children, docked = false, class: className, ...rest }: Props = $props();
</script>

<div
	{...rest}
	class={[
		'overflow-hidden border border-line bg-term',
		docked ? 'rounded-t-xl border-b-0 shadow-dock' : 'rounded-xl shadow-term',
		className,
	]}
>
	{@render children()}
</div>
