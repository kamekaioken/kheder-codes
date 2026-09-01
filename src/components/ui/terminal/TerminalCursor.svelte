<script lang="ts">
import type { HTMLAttributes } from 'svelte/elements';

type Props = HTMLAttributes<HTMLSpanElement> & {
	variant?: 'cell' | 'text';
};

const { variant = 'cell', class: className, ...rest }: Props = $props();

const variants = {
	cell: 'h-4 w-2 align-middle',
	text: 'ml-[.06em] h-[.82em] w-[.55em] translate-y-[.08em] align-baseline',
};
</script>

<span
	{...rest}
	aria-hidden="true"
	class={['inline-block bg-fg animate-blink', variants[variant], className]}
></span>
