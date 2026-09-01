<script lang="ts">
import type { HTMLAttributes } from 'svelte/elements';
import TerminalCursor from './TerminalCursor.svelte';
import TerminalTypedText from './TerminalTypedText.svelte';

type Props = HTMLAttributes<HTMLDivElement> & {
	user: string;
	host: string;
	cwd?: string;
	command?: string;
	typed?: number;
	cursor?: boolean;
};

const {
	user,
	host,
	cwd = '~',
	command,
	typed,
	cursor = false,
	class: className,
	...rest
}: Props = $props();
</script>

<div {...rest} class={className}>
	<span class="text-accent">{user}@{host}</span> <span class="text-dim"
		>{cwd} %</span
	>
	{#if command}<TerminalTypedText text={command} {typed} />{/if}{#if cursor}<TerminalCursor
		/>{/if}
</div>
