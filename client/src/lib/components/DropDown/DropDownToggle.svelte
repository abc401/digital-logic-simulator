<script lang="ts">
	import { getContext } from 'svelte';
	import type { DropDownContext } from './DropDown.svelte';

	let dropDownContext = getContext<DropDownContext>('drop-down-context');
</script>

<button
	on:click={() => {
		dropDownContext.toggleStatus();
	}}
>
	<slot />
</button>
