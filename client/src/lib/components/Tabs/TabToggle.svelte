<script lang="ts">
	import { getContext } from 'svelte';
	import { TABS_CONTAINER_CONTEXT_KEY, TabsContainerContext } from './TabsContainer.svelte';

	let containerContext = getContext<TabsContainerContext>(TABS_CONTAINER_CONTEXT_KEY);
	if (containerContext == null) {
		throw Error();
	}
	// let tabContext = getContext<TabContext>(TAB_CONTEXT_KEY);
	export let tabID: Symbol;
	// export let isSelected = false;
</script>

<button
	{...$$restProps}
	on:click={() => {
		containerContext.currentTab.update((value) => {
			if (value === tabID) {
				return undefined;
			} else {
				return tabID;
			}
		});
	}}
>
	<slot />
</button>
