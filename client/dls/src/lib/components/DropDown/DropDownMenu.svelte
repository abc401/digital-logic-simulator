<script context="module" lang="ts">
	export enum DropDownPosition {
		Below,
		Beside
	}
</script>

<script lang="ts">
	import { getContext } from 'svelte';
	import { DropDownContext } from './DropDown.svelte';
	import clsx from 'clsx';

	let { open } = getContext<DropDownContext>('drop-down-context');
	export let position: DropDownPosition = DropDownPosition.Below;
</script>

{#if $open}
	<div
		class={clsx(
			'z-10 flex flex-col gap-[1px] overflow-hidden rounded-sm border border-neutral-700 bg-neutral-700',
			{
				'absolute left-0 top-[calc(100%_+_0.25rem)] min-w-28 text-start':
					position === DropDownPosition.Below
			}
		)}
		{...$$restProps}
	>
		<slot />
	</div>
{/if}
