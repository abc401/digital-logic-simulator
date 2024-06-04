<script lang="ts">
	import { getContext } from 'svelte';
	import type { DropDownContext } from './DropDown.svelte';
	import clsx from 'clsx';

	let dropDownContext = getContext<DropDownContext>('drop-down-context');
	let { open } = dropDownContext;
	let className = '';
	export { className as class };
</script>

<button
	{...$$restProps}
	class={clsx(
		className,
		'rounded-sm [text-align:inherit] hover:bg-neutral-700 active:bg-neutral-500',
		{
			'bg-neutral-700': $open
		}
	)}
	on:click={() => {
		dropDownContext.open.update((value) => {
			return !value;
		});
	}}
>
	<slot />
</button>
