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

	export let onColor: string;
	export let offColor: string;
	export let circuitColor: string;
</script>

<script lang="ts">
	// import button from '@lib/button.svelte';

	import CircuitPropsPane from '@lib/CircuitPropsPane.svelte';
	import Scenes from '@lib/Scenes.svelte';
	import SimControls from '@lib/SimControls.svelte';
	import TopMenu from '@lib/TopMenu.svelte';

	import { canvasState, logs } from '@lib/stores/debugging';
	import { focusedCircuit } from '@lib/stores/focusedCircuit';

	import { SimEngine } from '@ts/engine';
	import { MouseStateMachine } from '@ts/interactivity/mouse/state-machine';
	import { TouchScreenStateMachine } from '@ts/interactivity/touchscreen/state-machine';

	import { SceneManager } from '@ts/scene/scene-manager';
	import { ViewManager } from '@ts/view-manager';
	import { onMount } from 'svelte';

	$: {
		console.log('Most recently selected circuit: ', $focusedCircuit);
	}

	onMount(() => {
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

		const style = getComputedStyle(document.body);
		onColor = style.getPropertyValue('--clr-on');
		offColor = style.getPropertyValue('--clr-off');
		circuitColor = style.getPropertyValue('--clr-circuit');

		function draw() {
			sceneManager.draw(ctx);
			setTimeout(draw, 1000 / 60);
		}
		draw();
	});
</script>

<div>
	<div class="fixed right-0 top-0 z-10 border border-red-600">
		<CircuitPropsPane />
	</div>
	<div class="absolute bottom-0 right-0">10</div>
	<TopMenu />
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

<SimControls />

<div>
	<h2>Logging</h2>

	<div>{@html $logs}</div>
</div>
