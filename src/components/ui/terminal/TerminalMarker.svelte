<script lang="ts">
type Props = {
	active?: boolean;
	symbol?: string;
};

const { active = false, symbol = '❯' }: Props = $props();
</script>

<span class="w-3.5 flex-none text-accent" aria-hidden="true"
	>{active ? symbol : ''}</span
>
