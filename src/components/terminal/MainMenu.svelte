<script lang="ts">
import TerminalMenu from '../ui/terminal/TerminalMenu.svelte';
import TerminalOutput from '../ui/terminal/TerminalOutput.svelte';
import TerminalRow from '../ui/terminal/TerminalRow.svelte';
import TerminalRowHint from '../ui/terminal/TerminalRowHint.svelte';
import TerminalRowLabel from '../ui/terminal/TerminalRowLabel.svelte';
import { getSession } from './session.svelte';

const session = getSession();
</script>

<div
	class="transition-opacity duration-250"
	style:opacity={session.submenu ? 0.4 : 1}
	data-testid="main-menu"
>
	<TerminalOutput class="mt-2.5 mb-1"
		>{session.labels.version}<br />{session.labels.choose}</TerminalOutput
	>

	<TerminalMenu label={session.labels.navLabel} class="mt-2 mb-1">
		{#each session.items as item, index (item.id)}
			<TerminalRow
				href={item.href}
				target={item.external ? '_blank' : undefined}
				rel={item.external ? 'noopener' : undefined}
				aria-current={item.id === session.activeItemId ? 'page' : undefined}
				data-testid={`menu-${item.id}`}
				selected={!session.submenu && index === session.selected}
				revealed={index < session.boot.rows.count}
				onselect={item.external ? undefined : () => session.open(index)}
			>
				<TerminalRowLabel class="text-fg">{item.name}</TerminalRowLabel>
				<TerminalRowHint>{item.desc}</TerminalRowHint>
			</TerminalRow>
		{/each}
	</TerminalMenu>
</div>
