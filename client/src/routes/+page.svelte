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
	import Button from '@lib/Button.svelte';

	import CircuitPropsPane from '@lib/CircuitPropsPane.svelte';
	import Scenes from '@lib/Scenes.svelte';
	import { circuitCreators, customCircuitCreator } from '@lib/stores/circuitCreators';
	import { currentScene } from '@lib/stores/currentScene';

	import { customCircuits } from '@lib/stores/customCircuits';
	import { canvasState, logs } from '@lib/stores/debugging';
	import { mostRecentlySelectedCircuit } from '@lib/stores/mostRecentlySelectedCircuit';

	import { SimEngine } from '@ts/engine';
	import { MouseStateMachine } from '@ts/interactivity/mouse/state-machine';
	import { CreatingCircuit as CreatingCircuitMouse } from '@ts/interactivity/mouse/states/creating-circuit';
	import { TouchScreenStateMachine } from '@ts/interactivity/touchscreen/state-machine';
	import { CreatingCircuit as CreatingCircuitTouchScreen } from '@ts/interactivity/touchscreen/states/creating-circuit';

	import { SceneManager } from '@ts/scene/scene-manager';
	import { ViewManager } from '@ts/view-manager';
	import { onMount } from 'svelte';

	$: {
		console.log('Most recently selected circuit: ', $mostRecentlySelectedCircuit);
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

		setInterval(function () {
			sceneManager.draw(ctx);
			// console.log('draw');
		}, 1000 / 60);
		// scheduler.runSim(ctx);
	});
</script>

<div>
	<div class="fixed right-0 top-0 border border-red-600">
		<CircuitPropsPane />
	</div>
	<div id="version">10</div>
	<div id="circuit-buttons">
		{#each $circuitCreators as [name, creator] (name)}
			{#if name != $currentScene.name}
				<Button
					on:click={() => {
						mouseStateMachine.state = new CreatingCircuitMouse(name, creator);
						touchScreenStateMachine.state = new CreatingCircuitTouchScreen(name, creator);
					}}>{name}</Button
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
			class="flex-grow"
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
	<Button
		on:click={() => {
			simEngine.runSim();
		}}>Run</Button
	>
	<Button
		on:click={() => {
			simEngine.tick();
		}}>Tick</Button
	>
	<Button
		on:click={() => {
			simEngine.paused = true;
		}}>Pause</Button
	>
</div>

<div>
	<h2>Logging</h2>

	<div>{@html $logs}</div>
</div>

<style>
	canvas {
		position: relative;
		outline: solid red 1px;
		outline-offset: -1px;
		touch-action: none;
		z-index: 1;
	}

	#version {
		position: absolute;
		right: 0;
		bottom: 0;
	}
</style>
