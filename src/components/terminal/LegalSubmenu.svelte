<script lang="ts">
import { onMount } from 'svelte';
import { Entrance } from '../ui/terminal/entrance.svelte';
import TerminalMenu from '../ui/terminal/TerminalMenu.svelte';
import TerminalOutput from '../ui/terminal/TerminalOutput.svelte';
import TerminalPrompt from '../ui/terminal/TerminalPrompt.svelte';
import TerminalRow from '../ui/terminal/TerminalRow.svelte';
import TerminalRowHint from '../ui/terminal/TerminalRowHint.svelte';
import { getSession } from './session.svelte';

const session = getSession();
const entrance = new Entrance(300);

onMount(() => entrance.settle());
</script>

<div
	class={['mt-2.5', entrance.active && 'animate-fade-in']}
	data-testid="legal-submenu"
>
	<TerminalPrompt
		user="kheder"
		host="mbp"
		command={`${session.boot.commandText} ${session.labels.legalCmd}`}
	/>

	<TerminalOutput class="mt-1.5 mb-0.5">{session.labels.legalCount}</TerminalOutput>

	<TerminalMenu label={session.labels.legalNavLabel} class="mt-1.5 mb-1">
		{#each session.legalDocs as doc, index (doc.id)}
			<TerminalRow
				href={doc.href}
				aria-current={doc.file === session.currentDocFile ? 'page' : undefined}
				data-testid={`legal-${doc.id}`}
				class="text-fg"
				selected={index === session.legalSelected}
				onselect={() => session.openLegal(index)}
			>
				<span class="min-w-[136px] flex-none">{doc.file}</span>
				<TerminalRowHint>{doc.title}</TerminalRowHint>
			</TerminalRow>
		{/each}
	</TerminalMenu>
</div>
