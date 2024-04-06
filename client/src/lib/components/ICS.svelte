<script>
	import { sceneManager } from '@routes/+page.svelte';
	import { customCircuits } from './stores/customCircuits';
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

			if ($customCircuits.get(circuitName) != null) {
				circuitName = prompt('The provided name has already been used for another circuit');
				continue;
			}
			break;
		}
		customCircuits.newCustomCircuit(circuitName);
	}
</script>

<div {...$$restProps}>
	<span class="px-4 py-2 text-xs uppercase opacity-60">Integrated Circuits</span>
	<ul class="grid grid-flow-row">
		{#each $customCircuits as [name, sceneId] (name)}
			<button
				class="px-4 py-2 text-start text-sm hover:bg-neutral-700 active:bg-neutral-500"
				on:click={() => {
					console.log(`Switching to ${name} scene`);
					sceneManager.setCurrentScene(sceneId);
				}}
			>
				{name}
			</button>
		{/each}
	</ul>
	<button
		class="px-4 py-2 text-start text-xs text-neutral-400 hover:bg-neutral-700 active:bg-neutral-500"
		on:click={newCustomCircuit}>New Circuit</button
	>
</div>
