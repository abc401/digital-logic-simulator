<script>
	import { mouseStateMachine, touchScreenStateMachine } from '@routes/+page.svelte';
	import { circuitCreators } from './stores/circuitCreators';
	import { currentScene } from '@ts/scene/scene';
	import { CreatingCircuit as CreatingCircuitMouse } from '@ts/interactivity/mouse/states/creating-circuit';
	import { CreatingCircuit as CreatingCircuitTouchScreen } from '@ts/interactivity/touchscreen/states/creating-circuit';
</script>

<div>
	{#each $circuitCreators as [name, creator] (name)}
		{#if name != $currentScene.name}
			<button
				on:click={() => {
					mouseStateMachine.state = new CreatingCircuitMouse(name, creator);
					touchScreenStateMachine.state = new CreatingCircuitTouchScreen(name, creator);
				}}>{name}</button
			>
		{/if}
	{/each}
</div>
