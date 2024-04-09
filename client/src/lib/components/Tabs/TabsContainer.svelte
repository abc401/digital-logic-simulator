<script context="module" lang="ts">
	export const TABS_CONTAINER_CONTEXT_KEY = 'tabs-container-context-key';
	export class TabsContainerContext {
		currentTab: Writable<Symbol | undefined>;
		constructor() {
			this.currentTab = writable(undefined);
		}
	}
</script>

<script lang="ts">
	import clsx from 'clsx';

	import { setContext } from 'svelte';
	import { writable, type Writable } from 'svelte/store';

	let context = new TabsContainerContext();
	setContext<TabsContainerContext>(TABS_CONTAINER_CONTEXT_KEY, context);
</script>

<slot />
