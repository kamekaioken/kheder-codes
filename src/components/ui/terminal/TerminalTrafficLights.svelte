<script lang="ts">
type Props = {
	closeLabel?: string;
	onclose?: () => void;
	minimizeLabel?: string;
	onminimize?: () => void;
};

const { closeLabel, onclose, minimizeLabel, onminimize }: Props = $props();

const dot = 'block size-3 rounded-full';
</script>

{#snippet light(
	tone: string,
	hover: string,
	label?: string,
	action?: () => void,
)}
	{#if action}
		<button
			type="button"
			class={[dot, tone, hover, 'cursor-pointer']}
			title={label}
			aria-label={label}
			onclick={action}
		></button>
	{:else}
		<span class={[dot, tone]}></span>
	{/if}
{/snippet}

{@render light('bg-tl-red', 'hover:shadow-tl-red', closeLabel, onclose)}
{@render light('bg-tl-yellow', 'hover:shadow-tl-yellow', minimizeLabel, onminimize)}
{@render light('bg-tl-green', '')}
