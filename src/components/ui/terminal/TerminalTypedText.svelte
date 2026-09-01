<script lang="ts">
type Props = {
	text: string;
	typed?: number;
	offset?: number;
	class?: string;
};

const { text, typed, offset = 0, class: className }: Props = $props();

const chars = $derived([...text]);
const revealed = $derived(typed ?? offset + chars.length);
</script>

{#each chars as char, index (index)}<span
		class={className}
		data-typed={offset + index < revealed}>{char}</span
	>{/each}
