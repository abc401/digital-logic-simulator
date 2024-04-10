<script context="module" lang="ts">
	export class DropDownContext {
		open: Writable<boolean>;
		constructor() {
			this.open = writable(false);
		}
	}
</script>

<script lang="ts">
	import { browser } from '$app/environment';
	import clsx from 'clsx';

	import { getContext, onDestroy, onMount, setContext } from 'svelte';
	import { writable, type Writable } from 'svelte/store';

	let context = new DropDownContext();
	setContext<DropDownContext>('drop-down-context', context);

	let div: HTMLDivElement;

	let clickListener = (ev: MouseEvent) => {
		if (!div.contains(ev.target as HTMLElement)) {
			context.open.set(false);
		}
	};

	let className = '';
	export { className as class };

	onMount(() => {
		document.addEventListener('click', clickListener);
	});

	onDestroy(() => {
		if (browser) {
			document.removeEventListener('click', clickListener);
		}
	});
</script>

<div class={clsx('relative', className)} {...$$restProps} bind:this={div} {...$$restProps}>
	<slot />
</div>

<!-- {#each Object.keys(config) as key}
		{#if config[key] instanceof Function || config[key] == null}
			<MenuItem text={key} on:click={getFunction(key)} />
		{:else}
			<MenuItemExpandable text={key}>
				<svelte:self config={config[key]} />
			</MenuItemExpandable>
		{/if}
	{/each} -->
