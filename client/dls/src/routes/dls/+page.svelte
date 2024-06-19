<script context="module" lang="ts">
	export let canvas: HTMLCanvasElement;
	export let ctx: CanvasRenderingContext2D;

	export let secondaryCanvas: HTMLCanvasElement;
	export let secondaryCtx: CanvasRenderingContext2D;

	export let simEngine = new SimEngine();
	export let view = new View();
	export let sceneManager = new SceneManager();
	export let actionsManager: ActionsManager;

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

	function getInstantiator(
		apiCircuit: ApiCircuit,
		apiProject: ApiProject,
		instantiatedScenes: Set<ID>
	): () => Circuit {
		if (apiCircuit.circuitType.toLowerCase() === 'customcircuitinputs') {
			return () => {
				const circuit = new CustomCircuitInputs();
				circuit.producerPins[0].onWireAttached = () => {};
				// circuit.producerPins.length = apiCircuit.nProducerPins;

				for (let i = circuit.producerPins.length; i < apiCircuit.nProducerPins; i++) {
					circuit.producerPins[i] = new ProducerPin(circuit, i);
				}
				circuit.producerPins[circuit.producerPins.length - 1].onWireAttached =
					CustomCircuitInputs.addPin;
				// const producerPin = circuit.producerPins[circuit.producerPins.length - 1];
				// producerPin.onWireAttached = CustomCircuitInputs.addPin;
				return circuit;
			};
		}
		if (apiCircuit.circuitType.toLowerCase() === 'customcircuitoutputs') {
			return () => {
				const circuit = new CustomCircuitOutputs();
				circuit.consumerPins[0].onWireAttached = () => {};
				// circuit.consumerPins.length = apiCircuit.nConsumerPins;

				// for (let i = 0; i < circuit.consumerPins.length; i++) {
				// 	circuit.consumerPins[i] = new ConsumerPin(circuit, i);
				// }
				for (let i = circuit.consumerPins.length; i < apiCircuit.nConsumerPins; i++) {
					circuit.consumerPins.push(new ConsumerPin(circuit, i));
				}
				circuit.consumerPins[circuit.consumerPins.length - 1].onWireAttached =
					CustomCircuitOutputs.addPin;
				// const consumerPin = circuit.consumerPins[circuit.consumerPins.length - 1];
				// consumerPin.onWireAttached = CustomCircuitOutputs.addPin;
				return circuit;
			};
		}

		const circuitType = apiCircuit.circuitType;

		let instantiator = circuitInstantiators[circuitType];
		if (instantiator == null) {
			instantiator = icInstantiators.get()[circuitType];
		}
		if (instantiator == null) {
			let apiScene: ApiScene | undefined;
			for (const [id, scene] of apiProject.scenes) {
				if (apiCircuit.circuitType.toLowerCase() === scene.name.toLowerCase()) {
					apiScene = scene;
				}
			}
			if (apiScene == null) {
				console.log('Circuit: ', apiCircuit);
				throw Error();
			}

			createScene(apiScene, apiProject, instantiatedScenes);
			instantiator = icInstantiators.get()[apiScene.id];
			if (instantiator == null) {
				console.log('Project: ', apiProject);
				console.log('Circuit: ', apiCircuit);
				throw Error();
			}
		}
		return instantiator;
	}

	function instantiateApiWire(apiWire: ApiWire, scene: Scene) {
		const fromCircuit = scene.idToCircuit.get(apiWire.fromCircuit);
		const toCircuit = scene.idToCircuit.get(apiWire.toCircuit);
		if (fromCircuit == null) {
			throw Error();
		}
		if (toCircuit == null) {
			throw Error();
		}

		const fromPin = fromCircuit.parentCircuit.producerPins.at(apiWire.fromPin);
		const toPin = toCircuit.parentCircuit.consumerPins.at(apiWire.toPin);
		if (fromPin == null) {
			console.log('fromCircuit', fromCircuit);
			console.log('toCircuit', toCircuit);
			console.log('ApiWire: ', apiWire);
			console.log('Scene: ', scene);
			throw Error();
		}
		if (toPin == null) {
			throw Error();
		}
		Wire.newRegisteredWithID(fromPin, toPin, scene, apiWire.id);
	}

	function instantiateApiCircuit(
		apiCircuit: ApiCircuit,
		apiProject: ApiProject,
		scene: Scene,
		instantiatedScenes: Set<ID>
	) {
		const instantiator = getInstantiator(apiCircuit, apiProject, instantiatedScenes);
		const cInstance = instantiator();
		for (const [key, value] of Object.entries(apiCircuit.props)) {
			const setter = getPropSetter(cInstance, key);
			if (!setter(cInstance, value)) {
				console.debug('Circuit: ', apiCircuit);
				console.debug('Key: ', key);
				console.debug('Value: ', value);
				throw Error();
			}
		}
		CircuitSceneObject.newRegistered(apiCircuit.id, cInstance, apiCircuit.posWrl, scene, ctx);
	}

	function createScene(apiScene: ApiScene, apiProject: ApiProject, instantiatedScenes: Set<ID>) {
		if (
			!(apiScene.id === 0 && apiScene.icInputs == null && apiScene.icOutputs == null) &&
			!(apiScene.id !== 0 && apiScene.icInputs != null && apiScene.icOutputs != null)
		) {
			console.log('Scene: ', apiScene);
			throw Error();
		}

		const scene = new Scene();
		scene.name = apiScene.name;

		for (const [, c] of apiScene.circuits) {
			instantiateApiCircuit(c, apiProject, scene, instantiatedScenes);
		}
		for (const [, apiWire] of apiScene.wires) {
			instantiateApiWire(apiWire, scene);
		}

		if (apiScene.id !== 0) {
			const customCircuitInputs = scene.idToCircuit.get(apiScene.icInputs as ID);
			if (customCircuitInputs == null) {
				throw Error();
			}
			const customCircuitOutputs = scene.idToCircuit.get(apiScene.icOutputs as ID);
			if (customCircuitOutputs == null) {
				throw Error();
			}
			scene.customCircuitInputs = customCircuitInputs.parentCircuit as CustomCircuitInputs;
			scene.customCircuitOutputs = customCircuitOutputs.parentCircuit as CustomCircuitOutputs;
		}

		sceneManager.registerSceneWithID(apiScene.id, scene);

		if (apiScene.id != HOME_SCENE_ID) {
			icNames.add(scene.name.toLowerCase());
			icInstantiators.newInstantiator(apiScene.id, icInstanciator(apiScene.id));
			integratedCircuits.update((circuits) => {
				circuits.set(apiScene.id, scene.name);
				return circuits;
			});
		}

		instantiatedScenes.add(apiScene.id);
	}

	function initProject(apiProject: ApiProject) {
		view.setView(apiProject.view);

		const instantiatedScenes = new Set<ID>();

		for (const [, apiScene] of apiProject.scenes) {
			createScene(apiScene, apiProject, instantiatedScenes);
		}

		const startingScene = sceneManager.scenes.get(apiProject.currentSceneID);
		if (startingScene == null) {
			console.log('Scenes of project: ', sceneManager.scenes);
			throw Error();
		}
		currentScene.init(startingScene);

		for (const selectedCircuit of apiProject.selectedCircuits.keys()) {
			sceneManager.selectCircuitUnchecked(selectedCircuit);
		}
		for (const selectedWire of apiProject.selectedWires.keys()) {
			const wire = startingScene.idToWire.get(selectedWire);
			if (wire == null) {
				throw Error();
			}
			sceneManager.selectWireUnchecked(wire);
		}
	}
</script>

<script lang="ts">
	import '@src/app.css';

	import SimControls from '@comps/SimControls.svelte';

	import { canvasState, logs } from '@lib/stores/debugging';
	import { focusedCircuit } from '@lib/stores/focusedCircuit';
	import { Wire } from '@ts/scene/objects/wire.js';

	import { SimEngine } from '@ts/engine';
	import { MouseStateMachine } from '@ts/interactivity/mouse/state-machine';
	import { TouchScreenStateMachine } from '@ts/interactivity/touchscreen/state-machine';

	import { SceneManager } from '@ts/scene/scene-manager';
	import { View } from '@ts/view-manager';
	import { onMount } from 'svelte';
	import TopMenu from '@lib/components/TopMenu.svelte';
	import SideBar from '@src/lib/components/SideBar.svelte';
	import { ActionsManager } from '@ts/interactivity/actions-manager';
	import { currentScene } from '@stores/currentScene.js';

	import { type ID } from '@src/ts/scene/scene';

	import { Scene } from '@ts/scene/scene';
	import {
		circuitInstantiators,
		icInstanciator,
		icInstantiators
	} from '@src/lib/stores/circuitInstantiators.js';
	import type { ApiCircuit, ApiProject, ApiScene, ApiWire } from '@ts/api/helpers.js';
	import {
		CircuitSceneObject,
		getPropSetter,
		setProp,
		type Circuit
	} from '@src/ts/scene/objects/circuits/circuit.js';
	import { CustomCircuitInputs } from '@src/ts/scene/objects/circuits/custom-circuit-inputs.js';
	import { CustomCircuitOutputs } from '@src/ts/scene/objects/circuits/custom-circuit-outputs.js';
	import { ProducerPin } from '@src/ts/scene/objects/producer-pin.js';
	import { ConsumerPin } from '@src/ts/scene/objects/consumer-pin.js';
	import { icNames, integratedCircuits } from '@src/lib/stores/integrated-circuits.js';
	import { HOME_SCENE_ID } from '@src/ts/config.js';

	export let data;

	const apiProject = data.project;

	console.log('data: ', JSON.stringify(data.project));
	console.log('data: ', data.project);

	$: {
		console.log('Most recently selected circuit: ', $focusedCircuit);
	}
	$: {
		console.log('currentScene: ', $currentScene);
	}

	onMount(() => {
		const ctx_ = canvas.getContext('2d');

		if (ctx_ == null) {
			throw Error();
		}

		ctx = ctx_;

		new ResizeObserver(() => {
			let canvasBoundingRect = canvas.getBoundingClientRect();
			canvas.width = canvasBoundingRect.width;
			canvas.height = canvasBoundingRect.height;
		}).observe(canvas);

		mouseStateMachine = new MouseStateMachine();
		touchScreenStateMachine = new TouchScreenStateMachine();
		actionsManager = new ActionsManager();
		console.log('TouchSM: ', touchScreenStateMachine);

		const style = getComputedStyle(document.body);
		onColor = style.getPropertyValue('--clr-on');
		offColor = style.getPropertyValue('--clr-off');
		circuitColor = style.getPropertyValue('--clr-accent');
		ornamentColor = style.getPropertyValue('--ornament-color');

		initProject(apiProject);

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

	<SideBar />

	<TopMenu
		class="z-10 col-span-1 col-start-[-2] row-start-1 flex flex-row gap-[1px] border-b-[1px] border-s-[1px] border-neutral-700 px-2 text-base font-normal"
	/>

	<div class="relative col-span-1 col-start-[-2] row-span-2 row-start-2 overflow-clip">
		<canvas
			class="h-full w-full border-s-[1px] border-neutral-700 bg-neutral-900"
			bind:this={canvas}
		>
			Please use a newer browser
		</canvas>
		<div
			class="pointer-events-none absolute right-0 top-0 z-10 mx-3 my-2 touch-none select-none text-neutral-50"
		>
			{@html $canvasState}
		</div>
		<SimControls
			class="absolute bottom-0 left-1/2 m-3 grid -translate-x-1/2 grid-flow-col justify-center rounded-lg border border-neutral-700 bg-neutral-900 px-2"
		/>
	</div>
</div>
