<script lang="ts">
import { onMount } from 'svelte';
import type { TerminalProps } from '../../lib/terminal';
import HeroIntro from './HeroIntro.svelte';
import { setSession, TerminalSession } from './session.svelte';
import TerminalScreen from './TerminalScreen.svelte';

const props: TerminalProps = $props();

const session = new TerminalSession(() => props);

setSession(session);

onMount(() => session.attach());

$effect(() => {
	session.boot.syncPhase();
});

$effect(() => {
	session.dock.syncRoute(session.current, session.submenu);
});
</script>

{#if session.showIntro}
	<HeroIntro />
{/if}

<TerminalScreen />
