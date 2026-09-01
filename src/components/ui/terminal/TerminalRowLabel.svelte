<script lang="ts">
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

type Props = HTMLAttributes<HTMLSpanElement> & { children: Snippet };

const { children, class: className, ...rest }: Props = $props();
</script>

<span {...rest} class={['min-w-[118px] flex-none font-bold', className]}
	>{@render children()}</span
>
