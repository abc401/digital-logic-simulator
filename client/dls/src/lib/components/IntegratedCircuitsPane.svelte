<script context="module" lang="ts">
</script>

<script lang="ts">
	import { rootDiv, sceneManager } from '@src/routes/dls/+page.svelte';
	import { integratedCircuits } from '@src/lib/stores/integrated-circuits';
	import IntegratedCircuitDisplay from './IntegratedCircuitDisplay.svelte';
</script>

<span class=" px-4 py-2 text-xs uppercase opacity-60">Integrated Circuits</span>
<div class="overflow-auto [scrollbar-width:thin]">
	<ul class="grid max-h-full grid-flow-row">
		{#each $integratedCircuits as [sceneId, name] (sceneId)}
			<IntegratedCircuitDisplay {sceneId} {name} />
		{/each}
	</ul>
</div>
<button
	class="border-t-[1px] border-neutral-700 px-4 py-2 text-start text-xs text-neutral-400 hover:bg-neutral-700 active:bg-neutral-500"
	on:click={() => {
		integratedCircuits.newIC('abc');
	}}>New Circuit</button
>
