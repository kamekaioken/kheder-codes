<script lang="ts">
import { onMount } from 'svelte';
import { Entrance } from '../ui/terminal/entrance.svelte';
import TerminalMenu from '../ui/terminal/TerminalMenu.svelte';
import TerminalOutput from '../ui/terminal/TerminalOutput.svelte';
import TerminalPrompt from '../ui/terminal/TerminalPrompt.svelte';
import LanguageRow from './LanguageRow.svelte';
import { getSession } from './session.svelte';
import ThemeRow from './ThemeRow.svelte';

const session = getSession();
const entrance = new Entrance(300);

onMount(() => entrance.settle());
</script>

<div
	class={['mt-2.5', entrance.active && 'animate-fade-in']}
	data-testid="settings-submenu"
>
	<TerminalPrompt
		user="kheder"
		host="mbp"
		command={`${session.boot.commandText} ${session.labels.settingsCmd}`}
	/>

	<TerminalOutput class="mt-1.5 mb-0.5"
		>{session.labels.settingsIntro}</TerminalOutput
	>

	<TerminalMenu
		as="group"
		label={session.labels.settingsLabel}
		class="mt-1.5 mb-1"
	>
		<LanguageRow />
		<ThemeRow />
	</TerminalMenu>
</div>
