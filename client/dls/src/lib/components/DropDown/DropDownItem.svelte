<script lang="ts">
	import { getContext } from 'svelte';
	import type { DropDownContext } from './DropDown.svelte';

	export let action: () => void = () => {};
	let context = getContext<DropDownContext>('drop-down-context');
	if (context == null) {
		throw Error();
	}
</script>

<button
	class="bg-neutral-800 p-2 [text-align:inherit] hover:bg-neutral-700 active:bg-neutral-500"
	{...$$restProps}
	on:click={() => {
		context.open.set(false);
		action();
	}}
>
	<slot />
</button>
