<script lang="ts">
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

type Props = HTMLAttributes<HTMLSpanElement> & { children: Snippet };

const { children, class: className, ...rest }: Props = $props();
</script>

<span {...rest} class={['text-[13px] text-dim', className]}
	>{@render children()}</span
>
