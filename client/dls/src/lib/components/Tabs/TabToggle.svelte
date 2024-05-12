<script lang="ts">
	import { getContext } from 'svelte';
	import { TABS_CONTAINER_CONTEXT_KEY, TabsContainerContext } from './TabsContainer.svelte';
	import clsx from 'clsx';

	let className = '';
	export { className as class };

	export let tabID: Symbol;

	let containerContext = getContext<TabsContainerContext>(TABS_CONTAINER_CONTEXT_KEY);
	if (containerContext == null) {
		throw Error();
	}

	let { currentTab, isClosed } = containerContext;
	// let tabContext = getContext<TabContext>(TAB_CONTEXT_KEY);

	$: isSelected = $currentTab === tabID && $isClosed === false;
	// export let isSelected = false;
</script>

<button
	class={clsx(className, 'm-1 p-2 ', {
		'hover:bg-neutral-700/50 active:bg-neutral-500/50': !isSelected,
		'bg-accent': isSelected
	})}
	{...$$restProps}
	on:click={() => {
		let isClosed = false;
		let unsub1 = containerContext.isClosed.subscribe((value) => {
			isClosed = value;
		});
		unsub1();

		let currentTab;
		let unsub = containerContext.currentTab.subscribe((value) => {
			currentTab = value;
		});
		unsub();

		if (currentTab !== tabID) {
			containerContext.currentTab.set(tabID);
			console.log('opened tab was different');
			if (isClosed) {
				containerContext.toggleClosed();
			}
			isSelected = true;
		} else {
			containerContext.toggleClosed();
			isSelected = false;
			console.log('opened tab was same');
		}

		// containerContext.currentTab.update((value) => {
		// 	// if (value === tabID) {
		// 	// 	return undefined;
		// 	// } else {
		// 	// 	return tabID;
		// 	// }
		// 	return tabID;
		// });
	}}
>
	<slot />
</button>
