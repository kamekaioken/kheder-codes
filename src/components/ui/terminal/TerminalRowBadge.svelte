<script lang="ts">
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

type Props = HTMLAttributes<HTMLSpanElement> & { children: Snippet };

const { children, class: className, ...rest }: Props = $props();
</script>

<span {...rest} class={['ml-auto flex-none text-xs text-dim', className]}
	>{@render children()}</span
>
