<script>
	import { sceneManager } from '@routes/+page.svelte';
	import { customCircuits } from './stores/customCircuits';
	import clsx from 'clsx';

	let className = '';
	export { className as class };

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

<ul class={clsx('flex flex-col', className)} {...$$restProps}>
	{#each $customCircuits as [name, sceneId] (name)}
		<!-- {#if name != $currentScene.name} -->
		<button
			on:click={() => {
				console.log(`Switching to ${name} scene`);
				sceneManager.setCurrentScene(sceneId);
			}}
		>
			{name}
		</button>
		<!-- {/if} -->
	{/each}
	<button on:click={newCustomCircuit}>New Custom Circuit</button>
</ul>
