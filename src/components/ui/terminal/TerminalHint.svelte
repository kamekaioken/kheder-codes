<script lang="ts">
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

type Props = HTMLAttributes<HTMLDivElement> & { children: Snippet };

const { children, class: className, ...rest }: Props = $props();
</script>

<div
	{...rest}
	class={[
		'mt-3 border-t border-dashed border-line pt-2.5 text-xs text-dim',
		className,
	]}
>
	{@render children()}
</div>
