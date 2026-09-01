<script lang="ts">
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

type Props = HTMLAttributes<HTMLDivElement> & { children: Snippet };

const { children, class: className, ...rest }: Props = $props();
</script>

<div {...rest} class={['px-[22px] pt-5 pb-6 text-sm leading-[1.9]', className]}>
	{@render children()}
</div>
