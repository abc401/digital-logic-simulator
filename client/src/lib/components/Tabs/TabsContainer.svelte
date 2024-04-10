<script context="module" lang="ts">
	export const TABS_CONTAINER_CONTEXT_KEY = 'tabs-container-context-key';
	export class TabsContainerContext {
		isClosed: Writable<boolean>;
		// private isClosedWritable: Writable<boolean>;

		currentTab: Writable<Symbol>;
		constructor() {
			let { set, subscribe, update } = writable(true);

			// this.isClosed = { subscribe };
			this.isClosed = { set, subscribe, update };

			this.currentTab = writable(Symbol());
		}

		toggleClosed() {
			this.isClosed.update((value) => {
				return !value;
			});
		}
	}
</script>

<script lang="ts">
	import clsx from 'clsx';

	import { createEventDispatcher, setContext } from 'svelte';
	import { writable, type Readable, type Writable } from 'svelte/store';

	export let context: TabsContainerContext = {} as TabsContainerContext;
	context = new TabsContainerContext();
	setContext<TabsContainerContext>(TABS_CONTAINER_CONTEXT_KEY, context);

	let dispatch = createEventDispatcher();
	let { isClosed } = context;

	$: {
		if ($isClosed) {
			dispatch('tabClosed', undefined);
			console.log('tabClosed');
		} else {
			dispatch('tabOpened', undefined);
			console.log('tabOpened');
		}
	}
</script>

<slot />
