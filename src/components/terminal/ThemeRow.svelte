<script lang="ts">
import TerminalChoice from '../ui/terminal/TerminalChoice.svelte';
import TerminalChoiceGroup from '../ui/terminal/TerminalChoiceGroup.svelte';
import TerminalRow from '../ui/terminal/TerminalRow.svelte';
import TerminalRowLabel from '../ui/terminal/TerminalRowLabel.svelte';
import { getSession } from './session.svelte';

const session = getSession();

const focused = $derived(session.settings.row === 'theme');
</script>

<TerminalRow
	role="group"
	aria-labelledby="settings-row-theme"
	data-testid="settings-theme"
	class="flex-wrap"
	selected={focused}
	highlight={false}
>
	<TerminalRowLabel id="settings-row-theme"
		>{session.labels.rowTheme}</TerminalRowLabel
	>
	<TerminalChoiceGroup>
		{#each session.settings.themeOptions as option, index (option.value)}
			<TerminalChoice
				aria-pressed={session.settings.theme === option.value}
				data-testid={`theme-${option.value}`}
				label={option.name}
				checked={session.settings.theme === option.value}
				focused={focused && session.settings.themeCursor === index}
				onselect={() => {
					session.settings.focusRow(1);
					session.settings.themeCursor = index;
					session.settings.setTheme(option.value);
				}}
			/>
		{/each}
	</TerminalChoiceGroup>
</TerminalRow>
