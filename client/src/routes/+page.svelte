<script context="module" lang="ts">
	export let canvas: HTMLCanvasElement;
	export let ctx: CanvasRenderingContext2D;

	export let secondaryCanvas: HTMLCanvasElement;
	export let secondaryCtx: CanvasRenderingContext2D;

	export let simEngine = new SimEngine();
	export let viewManager = new ViewManager();

	export let mouseStateMachine: MouseStateMachine;
	export let touchScreenStateMachine: TouchScreenStateMachine;

	// export let customCircuitScenes = new Map<string, number>([['Main', SceneManager.HOME_SCENE_ID]]);
	export let sceneManager = new SceneManager();
</script>

<script lang="ts">
	import { circuitCreators, customCircuitCreator } from '@lib/stores/circuitCreators';
	import { currentScene } from '@lib/stores/currentScene';

	import { customCircuitsScenes } from '@lib/stores/customCircuitsScenes';
	import { canvasState, logs } from '@lib/stores/debugging';

	import { SimEngine } from '@ts/engine';
	import { MouseStateMachine } from '@ts/interactivity/mouse/state-machine';
	import { CreatingCircuit as CreatingCircuitMouse } from '@ts/interactivity/mouse/states/creating-circuit';
	import { TouchScreenStateMachine } from '@ts/interactivity/touchscreen/state-machine';
	import { CreatingCircuit as CreatingCircuitTouchScreen } from '@ts/interactivity/touchscreen/states/creating-circuit';

	import { SceneManager } from '@ts/scene/scene-manager';
	import { ViewManager } from '@ts/view-manager';
	import { onMount } from 'svelte';

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

		mouseStateMachine = new MouseStateMachine();
		touchScreenStateMachine = new TouchScreenStateMachine();

		setInterval(function () {
			sceneManager.draw(ctx);
			// console.log('draw');
		}, 1000 / 60);
		// scheduler.runSim(ctx);
	});

	function newCustomCircuit() {
		let tmp = prompt('Enter name for custom circuit');
		while (true) {
			if (tmp == null) {
				return;
			}
			if (tmp.trim() === '') {
				tmp = prompt('The name for the custom circuit cannot be empty');
				continue;
			}

			if ($customCircuitsScenes.get(tmp) != null) {
				tmp = prompt('The provided name has already been used for another circuit');
				continue;
			}
			break;
		}
		const circuitName = tmp;
		const sceneId = sceneManager.newCustomScene();

		let scene = sceneManager.scenes.get(sceneId);
		if (scene == null) {
			throw Error();
		}
		scene.name = circuitName;

		customCircuitsScenes.newCircuit(circuitName);
		circuitCreators.newCustomCreator(circuitName, customCircuitCreator(circuitName));
	}
</script>

<div style="display: flex; flex-direction: row; width: 100%; gap: 1rem">
	<div id="version">10</div>
	<div style="display: flex; flex-direction: column; gap: 1rem">
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
		<button on:click={newCustomCircuit}>New Custom Circuit</button>
		<div id="custom-circuits">
			{#each $customCircuitsScenes as [name, sceneId] (name)}
				{#if name != $currentScene.name}
					<button
						on:click={() => {
							console.log(`Switching to ${name} scene`);
							sceneManager.setCurrentScene(sceneId);
						}}>{name}</button
					>
				{/if}
			{/each}
		</div>
	</div>

	<div id="root">
		<div id="canvas-parent">
			<div id="canvas-state">{@html $canvasState}</div>
			<canvas width="500" height="500" bind:this={canvas} id="main-canvas">
				Your browser does not support the canvas element
			</canvas>
		</div>
	</div>
</div>
<canvas width="500" height="500" bind:this={secondaryCanvas} id="secondary-canvas">
	Your browser does not support the canvas element
</canvas>

<div>
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

<style>
	*,
	*::after,
	*::before {
		margin: 0;
		padding: 0;
	}

	canvas {
		position: relative;
		outline: solid red 1px;
		outline-offset: -1px;
		touch-action: none;
		z-index: 1;
	}
	#canvas-parent {
		position: relative;
	}

	#canvas-state {
		position: absolute;
		pointer-events: none;
		touch-action: none;
	}

	#version {
		position: absolute;
		right: 0;
		bottom: 0;
	}
</style>
