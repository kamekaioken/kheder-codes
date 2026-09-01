<script lang="ts">
type Props = {
	closeLabel?: string;
	onclose?: () => void;
};

const { closeLabel, onclose }: Props = $props();

const dot = 'block size-3 rounded-full';
</script>

{#if onclose}
	<button
		type="button"
		class={[dot, 'cursor-pointer bg-tl-red hover:shadow-tl-red']}
		title={closeLabel}
		aria-label={closeLabel}
		onclick={onclose}
	></button>
{:else}
	<span class={[dot, 'bg-tl-red']}></span>
{/if}
<span class={[dot, 'bg-tl-yellow']}></span>
<span class={[dot, 'bg-tl-green']}></span>
