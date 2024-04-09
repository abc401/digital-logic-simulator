<script context="module" lang="ts">
</script>

<script lang="ts">
	import { rootDiv, sceneManager } from '@routes/+page.svelte';
	import { integratedCircuits } from '@src/lib/stores/integrated-circuits';
	import clsx from 'clsx';

	function newCustomCircuit() {
		let circuitName = prompt('Enter name for custom circuit');
		while (true) {
			if (circuitName == null) {
				return;
			}
			if (circuitName.trim() === '') {
				circuitName = prompt('The name for the custom circuit cannot be empty');
				continue;
			}

			if ($integratedCircuits.get(circuitName) != null) {
				circuitName = prompt('The provided name has already been used for another circuit');
				continue;
			}
			break;
		}
		integratedCircuits.newIC(circuitName);
	}
</script>

<span class=" px-4 py-2 text-xs uppercase opacity-60">Integrated Circuits</span>
<div class="overflow-auto [scrollbar-width:thin]">
	<ul class="grid max-h-full grid-flow-row">
		{#each $integratedCircuits as [name, sceneId] (name)}
			<button
				class=" px-4 py-2 text-start text-sm hover:bg-neutral-700 active:bg-neutral-500"
				on:click={() => {
					console.log(`Switching to ${name} scene`);
					sceneManager.setCurrentScene(sceneId);
				}}
			>
				{name}
			</button>
		{/each}
	</ul>
</div>
<button
	class="border-t-[1px] border-neutral-700 px-4 py-2 text-start text-xs text-neutral-400 hover:bg-neutral-700 active:bg-neutral-500"
	on:click={newCustomCircuit}>New Circuit</button
>
