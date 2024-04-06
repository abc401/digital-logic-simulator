<script lang="ts">
	import { getContext } from 'svelte';
	import { DropDownContext } from './DropDown.svelte';

	let { open } = getContext<DropDownContext>('drop-down-context');
</script>

{#if $open}
	<div>
		<slot />
	</div>
{/if}
