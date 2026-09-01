<script lang="ts">
import { onMount } from 'svelte';
import TerminalBody from '../ui/terminal/TerminalBody.svelte';
import TerminalHint from '../ui/terminal/TerminalHint.svelte';
import TerminalPrompt from '../ui/terminal/TerminalPrompt.svelte';
import TerminalTitleBar from '../ui/terminal/TerminalTitleBar.svelte';
import TerminalTrafficLights from '../ui/terminal/TerminalTrafficLights.svelte';
import TerminalWindow from '../ui/terminal/TerminalWindow.svelte';
import BlogSubmenu from './BlogSubmenu.svelte';
import LegalSubmenu from './LegalSubmenu.svelte';
import MainMenu from './MainMenu.svelte';
import SettingsSubmenu from './SettingsSubmenu.svelte';
import { getSession } from './session.svelte';

const session = getSession();
const dock = session.dock;

let panel: HTMLElement | null = null;
let body: HTMLElement | null = null;

const toggleLabel = $derived(
	dock.open ? session.labels.collapseTitle : session.labels.restoreTitle,
);

onMount(() => {
	dock.bindPanel(panel);
	dock.bindBody(body);
	return () => {
		dock.bindPanel(null);
		dock.bindBody(null);
	};
});

/* A submenu writes a new prompt at the bottom of the panel, so follow it there
   and wind back to the first prompt once it closes again. */
$effect(() => {
	if (session.submenu === null) dock.rewind();
	else dock.follow();
});

/** The title bar doubles as the handle, so a click anywhere but on one of its
 *  buttons folds the panel away — until it has a column of its own, where there
 *  is nothing to fold. */
function onBarClick(event: MouseEvent) {
	if (dock.side) return;
	if ((event.target as HTMLElement).closest('button')) return;
	dock.toggle();
}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	bind:this={panel}
	data-dock
	data-terminal
	data-testid="terminal"
	data-open={dock.open}
	class={[
		'mx-auto box-border w-full max-w-[840px] sm:px-4',
		session.boot.entrance.active && 'animate-fade-up',
	]}
>
	<TerminalWindow class="dock-window pb-[env(safe-area-inset-bottom)]">
		<TerminalTitleBar
			class={dock.side ? undefined : 'cursor-pointer'}
			data-testid="dock-bar"
			onclick={onBarClick}
		>
			{#snippet controls()}
				<TerminalTrafficLights
					closeLabel={session.labels.closeTitle}
					onclose={() => session.resetToHero()}
					minimizeLabel={dock.side ? undefined : session.labels.minimizeTitle}
					onminimize={dock.side ? undefined : () => dock.toggle()}
				/>
			{/snippet}

			{#snippet actions()}
				<button
					type="button"
					class="dock-toggle cursor-pointer px-1 text-[13px] leading-none text-dim"
					aria-expanded={dock.open}
					aria-controls="terminal-body"
					aria-label={toggleLabel}
					title={toggleLabel}
					data-testid="dock-toggle"
					onclick={() => dock.toggle()}>{dock.open ? '⌄' : '⌃'}</button
				>
			{/snippet}

			<span data-testid="term-title">{session.title}</span>
		</TerminalTitleBar>

		<div
			class="dock-panel grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none"
			style:grid-template-rows={dock.open ? '1fr' : '0fr'}
		>
			<div
				class={[
					'min-h-0 overflow-hidden transition-[visibility] motion-reduce:transition-none',
					dock.open ? 'visible' : 'invisible delay-200',
				]}
				inert={!dock.open}
			>
				<div
					id="terminal-body"
					class="dock-body flex max-h-[min(50dvh,460px)] flex-col"
				>
					<div
						bind:this={body}
						class="min-h-0 flex-1 overflow-y-auto overscroll-contain"
					>
						<TerminalBody>
							<TerminalPrompt
								user="kheder"
								host="mbp"
								command={session.boot.commandText}
								typed={session.boot.command.count}
								cursor={session.boot.phase === 'term' && !session.boot.menuOn}
							/>

							<div data-menu data-typed={session.boot.menuOn}>
								<MainMenu />

								{#if session.submenu === 'blog'}
									<BlogSubmenu />
								{/if}

								{#if session.submenu === 'settings'}
									<SettingsSubmenu />
								{/if}

								{#if session.submenu === 'legal'}
									<LegalSubmenu />
								{/if}
							</div>
						</TerminalBody>
					</div>

					<div data-typed={session.boot.menuOn} class="px-[22px] pb-4">
						<TerminalHint data-testid="hint-line">{session.hint}</TerminalHint>
					</div>
				</div>
			</div>
		</div>
	</TerminalWindow>
</div>
