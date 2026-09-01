<script lang="ts">
import { onMount } from 'svelte';
import { Entrance } from '../ui/terminal/entrance.svelte';
import TerminalMenu from '../ui/terminal/TerminalMenu.svelte';
import TerminalOutput from '../ui/terminal/TerminalOutput.svelte';
import TerminalPrompt from '../ui/terminal/TerminalPrompt.svelte';
import TerminalRow from '../ui/terminal/TerminalRow.svelte';
import TerminalRowBadge from '../ui/terminal/TerminalRowBadge.svelte';
import { getSession } from './session.svelte';

const session = getSession();
const entrance = new Entrance(300);

onMount(() => entrance.settle());
</script>

<div
	class={['mt-2.5', entrance.active && 'animate-fade-in']}
	data-testid="blog-submenu"
>
	<TerminalPrompt
		user="kheder"
		host="mbp"
		command={`${session.commandText} ${session.labels.blogCmd}`}
	/>

	<TerminalOutput class="mt-1.5 mb-0.5">{session.labels.blogCount}</TerminalOutput>

	<TerminalMenu label={session.labels.blogNavLabel} class="mt-1.5 mb-1">
		{#each session.posts as post, index (post.file)}
			<TerminalRow
				href={post.href}
				aria-current={post.file === session.currentPostFile
					? 'page'
					: undefined}
				data-testid={`post-${index + 1}`}
				class="text-fg"
				selected={index === session.postSelected}
				onselect={() => session.openPost(index)}
			>
				<span class="flex-none">{post.file}</span>
				<TerminalRowBadge>{session.labels.wip}</TerminalRowBadge>
			</TerminalRow>
		{/each}
	</TerminalMenu>
</div>
