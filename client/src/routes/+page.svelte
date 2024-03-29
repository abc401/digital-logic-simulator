<script context="module" lang="ts">
	export let canvas: HTMLCanvasElement;
	export let ctx: CanvasRenderingContext2D;

	export let secondaryCanvas: HTMLCanvasElement;
	export let secondaryCtx: CanvasRenderingContext2D;

	export let simEngine = new SimEngine();
	export let viewManager = new ViewManager();

	export let mouseStateMachine: MouseStateMachine;
	export let touchScreenStateMachine: TouchScreenStateMachine;

	export let sceneManager = new SceneManager();
</script>

<script lang="ts">
	// import button from '@lib/button.svelte';

	import CircuitPropsPane from '@lib/CircuitPropsPane.svelte';
	import Scenes from '@lib/Scenes.svelte';
	import { circuitCreators, customCircuitCreator } from '@lib/stores/circuitCreators';
	import { currentScene } from '@lib/stores/currentScene';

	import { customCircuits } from '@lib/stores/customCircuits';
	import { canvasState, logs } from '@lib/stores/debugging';
	import { focusedCircuit } from '@lib/stores/mostRecentlySelectedCircuit';

	import { SimEngine } from '@ts/engine';
	import { MouseStateMachine } from '@ts/interactivity/mouse/state-machine';
	import { CreatingCircuit as CreatingCircuitMouse } from '@ts/interactivity/mouse/states/creating-circuit';
	import { TouchScreenStateMachine } from '@ts/interactivity/touchscreen/state-machine';
	import { CreatingCircuit as CreatingCircuitTouchScreen } from '@ts/interactivity/touchscreen/states/creating-circuit';

	import { SceneManager } from '@ts/scene/scene-manager';
	import { ViewManager } from '@ts/view-manager';
	import { onMount } from 'svelte';

	$: {
		console.log('Most recently selected circuit: ', $focusedCircuit);
	}

	onMount(() => {
		console.log('Hello');
		const ctx_ = canvas.getContext('2d');
		const secondaryCtx_ = secondaryCanvas.getContext('2d');

		if (ctx_ == null) {
			throw Error();
		}
		if (secondaryCtx_ == null) {
			throw Error();
		}
		ctx = ctx_;
		secondaryCtx = secondaryCtx_;

		let canvasBoundingRect = canvas.getBoundingClientRect();
		canvas.width = canvasBoundingRect.width;
		canvas.height = canvasBoundingRect.height;

		mouseStateMachine = new MouseStateMachine();
		touchScreenStateMachine = new TouchScreenStateMachine();

		function draw() {
			sceneManager.draw(ctx);
			setTimeout(draw, 1000 / 60);
		}
		draw();
		// scheduler.runSim(ctx);
	});
</script>

<div>
	<div class="fixed right-0 top-0 z-10 border border-red-600">
		<CircuitPropsPane />
	</div>
	<button class="">Hello</button>
	<div class="absolute bottom-0 right-0">10</div>
	<div id="circuit-buttons">
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
	<div class="w=screen relative flex max-h-screen gap-4">
		<Scenes />

		<div class="pointer-events-none absolute right-0 touch-none">{@html $canvasState}</div>
		<canvas
			width="500"
			height="500"
			class="relative flex-grow touch-none outline outline-1 -outline-offset-1 outline-red-600"
			bind:this={canvas}
			on:resize={(ev) => {
				let boundingRect = canvas.getBoundingClientRect();
				canvas.width = boundingRect.width;
				canvas.height = boundingRect.height;
			}}
			id="main-canvas"
		>
			Your browser does not support the canvas element
		</canvas>
	</div>
</div>
<canvas width="500" height="500" bind:this={secondaryCanvas} id="secondary-canvas">
	Your browser does not support the canvas element
</canvas>

<div class="fixed bottom-0 left-1/2 -translate-x-1/2">
	<h2>Sim Controls</h2>
	<button
		on:click={() => {
			simEngine.runSim();
		}}>Run</button
	>
	<button
		on:click={() => {
			simEngine.tick();
		}}>Tick</button
	>
	<button
		on:click={() => {
			simEngine.paused = true;
		}}>Pause</button
	>
</div>

<div>
	<h2>Logging</h2>

	<div>{@html $logs}</div>
</div>
