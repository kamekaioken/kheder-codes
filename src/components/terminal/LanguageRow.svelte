<script lang="ts">
import TerminalChoice from '../ui/terminal/TerminalChoice.svelte';
import TerminalChoiceGroup from '../ui/terminal/TerminalChoiceGroup.svelte';
import TerminalRow from '../ui/terminal/TerminalRow.svelte';
import TerminalRowLabel from '../ui/terminal/TerminalRowLabel.svelte';
import { getSession } from './session.svelte';

const session = getSession();

const focused = $derived(session.settings.row === 'language');
</script>

<TerminalRow
	role="group"
	aria-labelledby="settings-row-language"
	data-testid="settings-language"
	class="flex-wrap"
	selected={focused}
	highlight={false}
>
	<TerminalRowLabel id="settings-row-language"
		>{session.labels.rowLanguage}</TerminalRowLabel
	>
	<TerminalChoiceGroup>
		{#each session.settings.languages as option, index (option.locale)}
			<TerminalChoice
				href={option.href}
				hreflang={option.locale}
				aria-current={option.active ? 'true' : undefined}
				data-testid={`lang-${option.locale}`}
				label={option.name}
				checked={option.active}
				focused={focused && session.settings.langCursor === index}
				onselect={() => {
					session.settings.focusRow(0);
					session.settings.langCursor = index;
				}}
			/>
		{/each}
	</TerminalChoiceGroup>
</TerminalRow>
