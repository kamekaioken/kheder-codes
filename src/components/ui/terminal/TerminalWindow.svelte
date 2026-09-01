<script lang="ts">
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

type Props = HTMLAttributes<HTMLDivElement> & { children: Snippet };

const { children, class: className, ...rest }: Props = $props();
</script>

<div
	{...rest}
	class={[
		'overflow-hidden rounded-xl border border-line bg-term shadow-term',
		className,
	]}
>
	{@render children()}
</div>
