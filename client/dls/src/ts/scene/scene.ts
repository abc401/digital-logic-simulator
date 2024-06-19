import { CustomCircuit } from './objects/circuits/custom-circuit.js';
import { CustomCircuitOutputs } from './objects/circuits/custom-circuit-outputs.js';
import { CustomCircuitInputs } from './objects/circuits/custom-circuit-inputs.js';
import { Wire } from './objects/wire.js';
import { StackList } from '@ts/data-structures/stacklist.js';
import { circuitColor, ctx, offColor, onColor, sceneManager } from '@src/routes/dls/+page.svelte';
// import { integratedCircuits } from '@src/lib/stores/integrated-circuits.js';
import { HOME_SCENE_NAME } from '@ts/config.js';
import { writable } from 'svelte/store';
import { CircuitSceneObject } from './objects/circuits/circuit.js';
import { Rect, Vec2 } from '../math.js';
import { View } from '../view-manager.js';
import { Queue } from '../data-structures/queue.js';

export type ID = number;
export type SceneID = number;

export const CUSTOM_CIRCUIT_INPUTS_ID = 0;
export const CUSTOM_CIRCUIT_OUTPUTS_ID = 1;

export class Scene {
	id: ID | undefined;
	name: string = '';
	customCircuitInputs: CustomCircuitInputs | undefined;
	customCircuitOutputs: CustomCircuitOutputs | undefined;
	wireBeingCreated: Wire | undefined;

	circuits: StackList<CircuitSceneObject> = new StackList();
	wires: StackList<Wire> = new StackList();

	currentObjectID = 0;
	idToCircuit: Map<ID, CircuitSceneObject> = new Map();
	idToWire: Map<ID, Wire> = new Map();

	tmpCircuits = new Set<CircuitSceneObject>();
	tmpWires = new Set<Wire>();

	lastUpdateIdx = 0;

	customCircuitInstances = new Map<
		SceneID,
		{ lastUpdateIdx: number; instances: Set<CustomCircuit> }
	>();

	constructor() {
		// console.trace('Scene Constructor');
	}

	static newWithIO() {
		const scene = new Scene();
		console.trace();

		const customInputs = new CustomCircuitInputs();
		const inputsSceneObject = CircuitSceneObject.newRegistered(
			scene.getNextID(),
			customInputs,
			new Vec2(90, 220),
			scene,
			ctx
		);
		inputsSceneObject.deletable = false;
		customInputs.sceneObject = inputsSceneObject;

		scene.circuits.push(customInputs.sceneObject);
		scene.customCircuitInputs = customInputs;

		const customOutputs = new CustomCircuitOutputs();
		const outputsSceneObject = CircuitSceneObject.newRegistered(
			scene.getNextID(),
			customOutputs,
			new Vec2(240, 220),
			scene,
			ctx
		);
		outputsSceneObject.deletable = false;
		customOutputs.sceneObject = outputsSceneObject;

		scene.circuits.push(customInputs.sceneObject);
		scene.customCircuitOutputs = customOutputs;
		return scene;
	}

	commitTmpObjects() {
		if (this.tmpCircuits.size > 0 || this.tmpWires.size > 0) {
			this.lastUpdateIdx += 1;
			console.log(`${this.name} updated with index ${this.lastUpdateIdx}`);
		} else {
			console.log(`${this.name} wasnt updated`);
		}
		this.tmpCircuits = new Set();
		this.tmpWires = new Set();
		console.log(`${this.name} Commited`);
	}

	getNextID() {
		const nextID = this.currentObjectID;
		this.currentObjectID += 1;
		return nextID;
	}

	/**
	 *  Before registering a circuit with this function please
	 *  ensure that the passed in id is not already taken
	 */
	registerCircuitWithID(id: ID, circuit: CircuitSceneObject) {
		this.idToCircuit.set(id, circuit);
		circuit.id = id;

		if (id + 1 > this.currentObjectID) {
			this.currentObjectID = id + 1;
		}

		this.circuits.push(circuit);
		if (this.name != HOME_SCENE_NAME) {
			this.tmpCircuits.add(circuit);
		}
		console.log('Scene: ', this);
	}

	registerCircuit(circuit: CircuitSceneObject) {
		const id = this.getNextID();
		this.registerCircuitWithID(id, circuit);
	}

	unregisterCircuit(id: ID) {
		const circuit = this.idToCircuit.get(id);
		if (circuit == null) {
			throw Error();
		}

		this.idToCircuit.delete(id);
		this.circuits.remove(circuit);
		this.tmpCircuits.delete(circuit);
	}

	/**
	 *  Before registering a wire with this function please
	 *  ensure that the passed in id is not already taken
	 */
	registerWireWithId(id: ID, wire: Wire) {
		if (this.idToWire.get(id) != null) {
			throw Error();
		}

		this.idToWire.set(id, wire);
		wire.id = id;

		if (id + 1 > this.currentObjectID) {
			this.currentObjectID = id + 1;
		}

		this.wires.push(wire);
		if (this.name != HOME_SCENE_NAME) {
			this.tmpWires.add(wire);
		}
	}

	registerWire(wire: Wire) {
		const id = this.getNextID();
		this.registerWireWithId(id, wire);
	}

	unregisterWire(id: ID) {
		const wire = this.idToWire.get(id);
		if (wire == null) {
			throw Error();
		}

		this.idToWire.delete(id);
		this.wires.remove(wire);
		this.tmpWires.delete(wire);
		wire.id = undefined;
	}

	reEvaluateICs() {
		console.log(`${this.name} customCircuitInstances: `, this.customCircuitInstances);
		for (const [id, entries] of this.customCircuitInstances) {
			console.log('ID: ', id);
			if (id == null) {
				throw Error();
			}
			const scene = sceneManager.scenes.get(id);
			console.log('Scene: ', scene);
			if (scene == null) {
				throw Error();
			}
			if (entries.lastUpdateIdx === scene.lastUpdateIdx) {
				continue;
			}
			console.log('entries.lastUpdateIdx != scene.lastUpdateIdx');
			console.log(`${this.name} reevaluated`);
			for (const instance of entries.instances) {
				instance.updateCircuitGraph();
			}
			entries.lastUpdateIdx = scene.lastUpdateIdx;
		}
		console.log(`${this.name} Scene: `, this);
	}

	refreshICLabels() {
		for (const [, { instances }] of this.customCircuitInstances) {
			for (const ic of instances) {
				ic.refreshLabel();
			}
		}
	}

	drawSvg() {
		let topLeftWrl = new Vec2(Infinity, Infinity);
		let bottomRightWrl = new Vec2(-Infinity, -Infinity);

		const svgPadding = 10;
		console.log('[Info] Rendering Svg for scene: ', this.name);

		for (const circuit of this.circuits.bottomToTop()) {
			if (circuit.data.looseRectWrl.x < topLeftWrl.x) {
				topLeftWrl = new Vec2(circuit.data.looseRectWrl.x, topLeftWrl.y);
			}
			if (circuit.data.posWrl.x + circuit.data.looseRectWrl.w > bottomRightWrl.x) {
				bottomRightWrl = new Vec2(
					circuit.data.posWrl.x + circuit.data.looseRectWrl.w,
					bottomRightWrl.y
				);
			}

			if (circuit.data.looseRectWrl.y < topLeftWrl.y) {
				topLeftWrl = new Vec2(topLeftWrl.x, circuit.data.looseRectWrl.y);
			}
			if (circuit.data.posWrl.y + circuit.data.looseRectWrl.h > bottomRightWrl.y) {
				bottomRightWrl = new Vec2(
					bottomRightWrl.x,
					circuit.data.posWrl.y + circuit.data.looseRectWrl.h
				);
			}
		}

		topLeftWrl = new Vec2(topLeftWrl.x - svgPadding, topLeftWrl.y - svgPadding);
		bottomRightWrl = new Vec2(bottomRightWrl.x + svgPadding, bottomRightWrl.y + svgPadding);

		const sceneBoundingRectWrl = Rect.fromEndPoints(topLeftWrl, bottomRightWrl);

		const view = new View();
		view.zoomLevel = Math.min(
			(sceneBoundingRectWrl.x + sceneBoundingRectWrl.w) / (bottomRightWrl.x - topLeftWrl.x),
			(sceneBoundingRectWrl.y + sceneBoundingRectWrl.h) / (bottomRightWrl.y - topLeftWrl.y)
		);
		view.panOffset = topLeftWrl.scalarMul(-view.zoomLevel);

		const startingCircuits = new Array<CircuitSceneObject>();

		outer: for (const circuit of this.circuits.bottomToTop()) {
			for (const cPin of circuit.data.parentCircuit.consumerPins) {
				if (cPin.wire != null) {
					continue outer;
				}
			}

			startingCircuits.push(circuit.data);
		}

		const renderedCircuits = new Set<CircuitSceneObject>();

		let innerSVG = '';

		for (const circuit of startingCircuits) {
			const queue = new Queue<CircuitSceneObject>();
			queue.enqueue(circuit);

			while (!queue.isEmpty()) {
				const currentCircuit = queue.dequeue() as CircuitSceneObject;
				if (renderedCircuits.has(currentCircuit)) {
					continue;
				}

				for (const pPin of currentCircuit.parentCircuit.producerPins) {
					for (const wire of pPin.wires) {
						if (wire.consumerPin == null) {
							throw Error();
						}

						innerSVG += drawWireSVG(wire, view);

						const consumerCircuit = wire.consumerPin.parentCircuit
							.sceneObject as CircuitSceneObject;

						queue.enqueue(consumerCircuit);
					}
				}

				renderedCircuits.add(currentCircuit);
				innerSVG += drawCircuitSVG(currentCircuit, view);
			}
		}
		return `
<svg
	viewBox="0 0 ${sceneBoundingRectWrl.x + sceneBoundingRectWrl.w} ${sceneBoundingRectWrl.y + sceneBoundingRectWrl.h}"
	xmlns="http://www.w3.org/2000/svg"
>
<style>
	@import url('https://fonts.googleapis.com/css2?family=Advent+Pro:ital,wght@0,100..900;1,100..900');
	.advent-pro {
	font-family: "Advent Pro", sans-serif;
	font-optical-sizing: auto;
	font-weight: 700;
	font-style: normal;
	font-variation-settings:
		"wdth" 100;
	}
</style>
${innerSVG}
</svg>`;
	}
}

function drawCircuitSVG(circuit: CircuitSceneObject, view: View) {
	const labelMetrics = view.worldToScreenRect(circuit.getLabelMetrics());
	const bodyRectScr = view.worldToScreenRect(circuit.bodyRectWrl);

	let actualLabel: string;
	if (circuit.label === circuit.parentCircuit.circuitType) {
		actualLabel = circuit.label;
	} else {
		actualLabel = `${circuit.label}(${circuit.parentCircuit.circuitType})`;
	}

	const remainingBodySpaceY =
		bodyRectScr.h - (labelMetrics.h + CircuitSceneObject.paddingYWrl * view.zoomLevel * 2);
	const remainingBodySpaceX =
		bodyRectScr.w - (labelMetrics.w + CircuitSceneObject.paddingXWrl * view.zoomLevel * 2);

	let svg = `
		<rect
			x="${bodyRectScr.x}"
			y="${bodyRectScr.y}"
			width="${bodyRectScr.w}"
			height="${bodyRectScr.h}"
			rx="${4}"
			fill="${circuitColor}"
		/>

		<text
			fill="#fff"
			class="advent-pro"
			font-size="${CircuitSceneObject.labelTextSizeWrl * view.zoomLevel}"
		
			x="${bodyRectScr.x + CircuitSceneObject.paddingXWrl * view.zoomLevel + remainingBodySpaceX / 2}"
			y="${
				bodyRectScr.y +
				bodyRectScr.h -
				CircuitSceneObject.paddingYWrl * view.zoomLevel -
				remainingBodySpaceY / 2
			}"
			>${actualLabel}</text
		>
		
		`;

	for (const pin of circuit.parentCircuit.consumerPins) {
		svg += drawPinSVG({ posWrl: pin.getLocWrl(), value: pin.value }, view);
	}
	for (const pin of circuit.parentCircuit.producerPins) {
		svg += drawPinSVG({ posWrl: pin.getLocWrl(), value: pin.value }, view);
	}
	return svg;
}

function drawPinSVG(pin: { posWrl: Vec2; value: boolean }, view: View) {
	const posScr = view.worldToScreen(pin.posWrl);
	let fillStyle = offColor;
	if (pin.value) {
		fillStyle = onColor;
	}

	const svg = `
		<circle
			cx="${posScr.x}"
			cy="${posScr.y}"
			r="${CircuitSceneObject.pinRadiusWrl * view.zoomLevel}"
			fill="${fillStyle}"
		/>
		`;
	return svg;
}

function drawWireSVG(wire: Wire, view: View) {
	const fromPosScr = view.worldToScreen(wire.producerPin?.getLocWrl() as Vec2);
	const toPosScr = view.worldToScreen(wire.consumerPin?.getLocWrl() as Vec2);
	const svg = `
	<line
		x1="${fromPosScr.x}"
		y1="${fromPosScr.y}"
		x2="${toPosScr.x}"
		y2="${toPosScr.y}"
		stroke="${wire.value ? onColor : offColor}"
		stroke-width="${10 * view.zoomLevel}"
	/>
	`;
	return svg;
}
