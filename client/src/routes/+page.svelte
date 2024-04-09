<script context="module" lang="ts">
	export let canvas: HTMLCanvasElement;
	export let ctx: CanvasRenderingContext2D;

	export let secondaryCanvas: HTMLCanvasElement;
	export let secondaryCtx: CanvasRenderingContext2D;

	export let simEngine = new SimEngine();
	export let viewManager = new ViewManager();

	export let sceneManager = new SceneManager();

	export let onColor: string;
	export let offColor: string;
	export let circuitColor: string;
	export let ornamentColor: string;

	export let mouseStateMachine: MouseStateMachine;
	export let touchScreenStateMachine: TouchScreenStateMachine;
	export function getSM() {
		return [mouseStateMachine, touchScreenStateMachine];
	}

	export let rootDiv: HTMLDivElement;
</script>

<script lang="ts">
	// import button from '@lib/button.svelte';

	import CircuitPropsPane from '@comps/CircuitPropsPane.svelte';
	import ICS from '@src/lib/components/IntegratedCircuitsPane.svelte';
	import SimControls from '@comps/SimControls.svelte';
	// import TopMenu from '@comps/TopMenu.svelte';
	import DropDown from '@lib/components/DropDown/DropDown.svelte';
	import DropDownToggle from '@lib/components/DropDown/DropDownToggle.svelte';
	import DropDownMenu from '@lib/components/DropDown/DropDownMenu.svelte';
	import DropDownItem from '@lib/components/DropDown/DropDownItem.svelte';

	import { canvasState, logs } from '@lib/stores/debugging';
	import { focusedCircuit } from '@lib/stores/focusedCircuit';

	import { SimEngine } from '@ts/engine';
	import { MouseStateMachine } from '@ts/interactivity/mouse/state-machine';
	import { TouchScreenStateMachine } from '@ts/interactivity/touchscreen/state-machine';

	import { SceneManager } from '@ts/scene/scene-manager';
	import { ViewManager } from '@ts/view-manager';
	import { onMount } from 'svelte';
	import { circuitInstanciators } from '@lib/stores/circuitCreators';
	import { CreatingCircuit as CreatingCircuitMouse } from '@ts/interactivity/mouse/states/creating-circuit';
	import { CreatingCircuit as CreatingCircuitTouchScreen } from '@ts/interactivity/touchscreen/states/creating-circuit';
	import TopMenu from '@lib/components/TopMenu.svelte';
	import SideBar, { configResizing } from '@src/lib/components/SideBar.svelte';

	$: {
		console.log('Most recently selected circuit: ', $focusedCircuit);
	}

	onMount(() => {
		const ctx_ = canvas.getContext('2d');
		// const secondaryCtx_ = secondaryCanvas.getContext('2d');

		if (ctx_ == null) {
			throw Error();
		}
		// if (secondaryCtx_ == null) {
		// 	throw Error();
		// }
		ctx = ctx_;
		// secondaryCtx = secondaryCtx_;

		new ResizeObserver(() => {
			let canvasBoundingRect = canvas.getBoundingClientRect();
			canvas.width = canvasBoundingRect.width;
			canvas.height = canvasBoundingRect.height;
		}).observe(canvas);

		// let canvasBoundingRect = canvas.getBoundingClientRect();
		// canvas.width = canvasBoundingRect.width;
		// canvas.height = canvasBoundingRect.height;

		mouseStateMachine = new MouseStateMachine();
		touchScreenStateMachine = new TouchScreenStateMachine();
		console.log('TouchSM: ', touchScreenStateMachine);

		const style = getComputedStyle(document.body);
		onColor = style.getPropertyValue('--clr-on');
		offColor = style.getPropertyValue('--clr-off');
		circuitColor = style.getPropertyValue('--clr-circuit');
		ornamentColor = style.getPropertyValue('--ornament-color');

		function draw() {
			sceneManager.draw(ctx);
			setTimeout(draw, 1000 / 60);
		}
		draw();
	});
</script>

<svelte:head>
	<title>Digital Logic Simulator</title>
</svelte:head>

<div
	bind:this={rootDiv}
	class="grid h-svh w-screen grid-cols-[auto_minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)]"
>
	<!-- <CircuitPropsPane class="fixed right-0 top-0 z-10 border border-red-600" /> -->
	<!-- <div class="absolute bottom-0 right-0">10</div> -->
	<TopMenu
		class="z-10 col-span-1 col-start-[-2] row-start-1 flex flex-row gap-[1px]  overflow-x-auto border-b-[1px] border-s-[1px] border-neutral-700 px-2 text-xs"
	/>

	<div
		class="z-10 col-start-1 row-start-1 row-end-[-1] grid h-full grid-cols-[auto_var(--side-bar-width)_4px] overflow-hidden border border-t-0 border-neutral-700"
	>
		<SideBar />
	</div>

	<div class="relative col-span-1 col-start-[-2] row-span-2 row-start-2 overflow-clip">
		<canvas
			class="h-full w-full border-s-[1px] border-neutral-700 bg-neutral-900"
			bind:this={canvas}
		>
			Please use a newer browser
		</canvas>
		<div
			class="pointer-events-none absolute right-0 top-0 z-10 mx-3 my-2 touch-none text-neutral-50"
		>
			{@html $canvasState}
		</div>
		<SimControls
			class="absolute bottom-0 left-1/2 grid -translate-x-1/2 grid-flow-col justify-center rounded-lg border border-neutral-700 bg-neutral-900 px-2"
		/>
	</div>
</div>
<!-- on:resize={(ev) => {
				let boundingRect = canvas.getBoundingClientRect();
				canvas.width = boundingRect.width;
				canvas.height = boundingRect.height;
			}} -->
<!-- <canvas width="500" height="500" bind:this={secondaryCanvas} id="secondary-canvas">
	Your browser does not support the canvas element
</canvas> -->

<!-- <div>
	<h2>Logging</h2>

	<div>{@html $logs}</div>
</div> -->
