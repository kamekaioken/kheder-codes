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
	data-testid="team-submenu"
>
	<TerminalPrompt
		user="kheder"
		host="mbp"
		command={`${session.boot.commandText} ${session.labels.teamCmd}`}
	/>

	<TerminalOutput class="mt-1.5 mb-0.5">{session.labels.teamCount}</TerminalOutput>

	<TerminalMenu label={session.labels.teamNavLabel} class="mt-1.5 mb-1">
		{#each session.members as member, index (member.file)}
			<TerminalRow
				href={member.href}
				aria-current={member.file === session.currentDocFile
					? 'page'
					: undefined}
				data-testid={`member-${index + 1}`}
				class="text-fg"
				selected={index === session.memberSelected}
				onselect={() => session.openMember(index)}
			>
				<span class="min-w-[156px] flex-none">{member.file}</span>
				<TerminalRowHint>{member.role}</TerminalRowHint>
			</TerminalRow>
		{/each}
	</TerminalMenu>
</div>
