<script lang="ts">
import TerminalBody from '../ui/terminal/TerminalBody.svelte';
import TerminalHint from '../ui/terminal/TerminalHint.svelte';
import TerminalPrompt from '../ui/terminal/TerminalPrompt.svelte';
import TerminalTitleBar from '../ui/terminal/TerminalTitleBar.svelte';
import TerminalTrafficLights from '../ui/terminal/TerminalTrafficLights.svelte';
import TerminalWindow from '../ui/terminal/TerminalWindow.svelte';
import BlogSubmenu from './BlogSubmenu.svelte';
import MainMenu from './MainMenu.svelte';
import SettingsSubmenu from './SettingsSubmenu.svelte';
import { getSession } from './session.svelte';

const session = getSession();
</script>

<div
	data-terminal
	data-testid="terminal"
	class={[
		'mx-auto box-border w-full max-w-[840px] px-4 pt-[clamp(20px,5vh,56px)]',
		session.entrance.active && 'animate-fade-up',
	]}
>
	<TerminalWindow>
		<TerminalTitleBar>
			{#snippet controls()}
				<TerminalTrafficLights
					closeLabel={session.labels.closeTitle}
					onclose={() => session.resetToHero()}
				/>
			{/snippet}
			<span data-testid="term-title">{session.title}</span>
		</TerminalTitleBar>

		<TerminalBody>
			<TerminalPrompt
				user="kheder"
				host="mbp"
				command={session.commandText}
				typed={session.command.count}
				cursor={session.phase === 'term' && !session.menuOn}
			/>

			<div data-menu data-typed={session.menuOn}>
				<MainMenu />

				{#if session.submenu === 'blog'}
					<BlogSubmenu />
				{/if}

				{#if session.submenu === 'settings'}
					<SettingsSubmenu />
				{/if}

				<TerminalHint data-testid="hint-line">{session.hint}</TerminalHint>
			</div>
		</TerminalBody>
	</TerminalWindow>
</div>
