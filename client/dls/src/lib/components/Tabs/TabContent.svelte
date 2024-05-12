<script lang="ts">
	import { getContext, setContext } from 'svelte';
	import TabsContainer, {
		TABS_CONTAINER_CONTEXT_KEY,
		TabsContainerContext
	} from './TabsContainer.svelte';

	let containerContext = getContext<TabsContainerContext>(TABS_CONTAINER_CONTEXT_KEY);
	if (containerContext == null) {
		throw Error();
	}
	let { currentTab } = containerContext;
	export let tabID: Symbol;
</script>

{#if $currentTab === tabID}
	<div {...$$restProps}>
		<slot />
	</div>
{/if}
