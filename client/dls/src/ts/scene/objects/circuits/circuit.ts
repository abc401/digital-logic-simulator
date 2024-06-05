import { Rect, Vec2 } from '@ts/math.js';
// import { Scene } from '@ts/scene/scene.js';
import { SimEvent, UpdationStrategy } from '@ts/engine.js';
import { ConsumerPin } from '../consumer-pin.js';
import { ProducerPin } from '../producer-pin.js';
import { Wire } from '../wire.js';
import {
	actionsManager,
	circuitColor,
	ornamentColor,
	sceneManager,
	simEngine,
	view
} from '@routes/+page.svelte';
import { Scene } from '@ts/scene/scene.js';
// import { CircuitSceneObject } from './circuit.js';
// import { CircuitSceneObject } from './circuit.js';
import type { ID } from '../../scene.js';
import { PIN_EXTRUSION_WRL, PIN_TO_PIN_DISTANCE_WRL } from '@src/ts/config.js';
import { ConcreteObjectKind } from '../../scene-manager.js';
import type { UserAction } from '@src/ts/interactivity/actions-manager.js';
import { SetCircuitPropUserAction } from '@src/ts/interactivity/actions.js';
import type { View } from '@src/ts/view-manager.js';
// import type { Circuit } from './circuit.js';

export type CircuitUpdateHandeler = (self: Circuit) => void;

export enum CircuitPropType {
	Bool,
	String,
	NaturalNumber
}

export type Props = { label: string; [key: string]: any };
export type PropTypes = { [key: string]: CircuitPropType };
export type PropSetter = (circuit: Circuit, value: any) => boolean;
export type PropSetters = { [key: string]: PropSetter };

// function identitiyPropSetter(name: string) {
// 	return function (circuit: Circuit, value: any) {
// 		circuit.props[name] = value;
// 		return true;
// 	};
// }

export const defaultPropTypes: PropTypes = {
	label: CircuitPropType.String
};
export const defaultPropSetters: PropSetters = {
	label: function (circuit, value) {
		if (typeof value != 'string') {
			throw Error();
		}
		if (circuit.sceneObject == null) {
			throw Error();
		}

		if (value.trim() === '') {
			circuit.props.label = circuit.circuitType;
			circuit.sceneObject.refreshLabel();
			return false;
		}

		circuit.props.label = value.trim();
		circuit.sceneObject.refreshLabel();
		return true;
	}
};

export interface Circuit {
	circuitType: string;

	props: Props;
	propTypes: PropTypes;
	propSetters: PropSetters;

	consumerPins: ConsumerPin[];
	producerPins: ProducerPin[];
	updateHandeler: CircuitUpdateHandeler;

	updationStrategy: UpdationStrategy;
	inputWireUpdationStrategy: UpdationStrategy;
	outputWireUpdationStrategy: UpdationStrategy;

	simFrameAllocated: boolean;

	sceneObject: CircuitSceneObject | undefined;

	clone(): Circuit;
	// configSceneObject(posWrl: Rect, scene: Scene | undefined): void;
	onSceneObjectConfigured(): void;
}

export function dummyCircuit() {
	const circuit: Circuit = {
		consumerPins: [],
		producerPins: [],

		circuitType: 'Dummy',
		props: { label: 'Dummy' },
		propTypes: {},
		propSetters: {},

		updateHandeler() {},

		updationStrategy: UpdationStrategy.InNextFrame,
		inputWireUpdationStrategy: UpdationStrategy.InNextFrame,
		outputWireUpdationStrategy: UpdationStrategy.InNextFrame,
		simFrameAllocated: true,

		sceneObject: undefined,
		onSceneObjectConfigured() {},
		clone: dummyCircuit
	};
	return circuit;
}

export function circuitCloneHelper(circuit: Circuit) {
	const cloned = Object.assign({}, circuit);
	Object.setPrototypeOf(cloned, Object.getPrototypeOf(circuit));

	cloned.producerPins = new Array(circuit.producerPins.length);
	cloned.consumerPins = new Array(circuit.consumerPins.length);

	if (circuit.simFrameAllocated) {
		simEngine.nextFrameEvents.enqueue(new SimEvent(cloned, cloned.updateHandeler));
	}

	// cloned.sceneObject = undefined;

	for (let i = 0; i < circuit.producerPins.length; i++) {
		cloned.producerPins[i] = new ProducerPin(cloned, i, circuit.producerPins[i].value);
	}
	for (let i = 0; i < circuit.consumerPins.length; i++) {
		cloned.consumerPins[i] = new ConsumerPin(cloned, i, circuit.consumerPins[i].value);
	}
	console.log('[circuitCloneHelper] circuit: ', circuit);
	console.log('[circuitCloneHelper] cloned: ', cloned);
	return cloned;
}

export function cloneGraphAfterCircuit(
	start: Circuit,
	clonedCircuits: Circuit[],
	clonedWires: Wire[],
	circuitCloneMapping: Map<Circuit, Circuit>,
	wireCloneMapping: Map<Wire, Wire>
) {
	const tmp = circuitCloneMapping.get(start);
	if (tmp != null) {
		return tmp;
	}

	const circuit = start;
	const cloned = circuit.clone();

	clonedCircuits.push(cloned);
	circuitCloneMapping.set(circuit, cloned);

	for (let pPinIdx = 0; pPinIdx < circuit.producerPins.length; pPinIdx++) {
		for (let wireIdx = 0; wireIdx < circuit.producerPins[pPinIdx].wires.length; wireIdx++) {
			console.log('[cloneCircuitTree] pPinIdx: ', pPinIdx);
			console.log('[cloneCircuitTree] circuit: ', circuit);
			console.log('[cloneCircuitTree] cloned: ', cloned);
			cloned.producerPins[pPinIdx].wires[wireIdx] = cloneGraphAfterWire(
				circuit.producerPins[pPinIdx].wires[wireIdx],
				clonedCircuits,
				clonedWires,
				circuitCloneMapping,
				wireCloneMapping
			) as Wire;
		}
	}
	return cloned;
}

function cloneGraphAfterWire(
	start: Wire,
	clonedCircuits: Circuit[],
	clonedWires: Wire[],
	circuitCloneMapping: Map<Circuit, Circuit>,
	wireCloneMapping: Map<Wire, Wire>
) {
	const tmp = wireCloneMapping.get(start);
	if (tmp != null) {
		return tmp;
	}

	const wire = start;
	const cloned = wire.clone();

	clonedWires.push(cloned);
	wireCloneMapping.set(wire, cloned);

	if (wire.consumerPin != null) {
		const consumerCircuit = cloneGraphAfterCircuit(
			wire.consumerPin.parentCircuit,
			clonedCircuits,
			clonedWires,
			circuitCloneMapping,
			wireCloneMapping
		);

		// console.log("[cloneCircuitTree] [Wire] id: ", start.id);
		// console.log("[cloneCircuitTree] [Wire] wire: ", wire);
		// console.log("[cloneCircuitTree] [Wire] cloned: ", cloned);
		cloned.setConsumerPinNoUpdate(consumerCircuit.consumerPins[wire.consumerPin.pinIndex]);
	}
	if (wire.producerPin != null) {
		const producerCircuit = cloneGraphAfterCircuit(
			wire.producerPin.parentCircuit,
			clonedCircuits,
			clonedWires,
			circuitCloneMapping,
			wireCloneMapping
		);
		cloned.setProducerPinNoUpdate(producerCircuit.producerPins[wire.producerPin.pinIndex]);
	}
	return cloned;
}

export function setConsumerPinNumber(circuit: Circuit, nConsumerPins: number) {
	console.log('[setConsumerPinNumber] Circuit: ', circuit);
	console.log('nConsumerPins: ', nConsumerPins);
	if (circuit.consumerPins.length === nConsumerPins) {
		return true;
	}
	let nConnectedPins = 0;
	for (const pin of circuit.consumerPins) {
		if (pin.wire != undefined) {
			nConnectedPins += 1;
		}
	}
	console.log('nConnectedPins: ', nConnectedPins);
	if (nConnectedPins > nConsumerPins) {
		return false;
	}
	const newPins = new Array<ConsumerPin>(nConsumerPins);
	let pinIndex = 0;
	for (const pin of circuit.consumerPins) {
		if (pin.wire != null) {
			newPins[pinIndex] = pin;
			pin.pinIndex = pinIndex;
			pinIndex += 1;
		}
	}
	for (let i = nConnectedPins; i < nConsumerPins; i++) {
		newPins[i] = new ConsumerPin(circuit, i);
	}
	circuit.consumerPins = newPins;
	console.log('[setConsumerPinNumber] Circuit: ', circuit);
	return true;
}

export function getPropType(circuit: Circuit, name: string) {
	let propType: CircuitPropType;
	if (name in defaultPropTypes) {
		propType = defaultPropTypes[name];
	} else {
		propType = circuit.propTypes[name];
	}
	if (propType === null) {
		throw Error();
	}
	return propType;
}

export function getPropSetter(circuit: Circuit, name: string) {
	let propSetter: PropSetter;
	if (name in defaultPropSetters) {
		propSetter = defaultPropSetters[name];
	} else {
		propSetter = circuit.propSetters[name];
	}
	if (propSetter == null) {
		throw Error();
	}
	return propSetter;
}

export function setProp(circuit: Circuit, name: string, value: any) {
	if (
		circuit.sceneObject == null ||
		circuit.sceneObject.id == null ||
		circuit.sceneObject.parentScene.id == null
	) {
		throw Error();
	}

	const propSetter = getPropSetter(circuit, name);
	const previousValue = circuit.props[name];
	if (!propSetter(circuit, value)) {
		return false;
	}
	const newValue = circuit.props[name];
	if (previousValue != newValue) {
		actionsManager.push(
			new SetCircuitPropUserAction(
				circuit.sceneObject.parentScene.id,
				circuit.sceneObject.id,
				name,
				value,
				previousValue
			)
		);
	}
}

export class CircuitSceneObject {
	id: ID | undefined;
	parentScene: Scene;

	tightRectWrl: Rect;
	looseRectWrl: Rect;
	// headRectWrl: Rect;
	bodyRectWrl: Rect;

	static minWidthWrl = 100;
	static headPaddingYWrl = 10;
	static paddingXWrl = 30;
	static paddingYWrl = 30;
	// static paddingYWrl = 15;
	static pinRadiusWrl = PIN_EXTRUSION_WRL;
	static labelTextSizeWrl = 48;

	isSelected = false;
	label: string;
	deletable: boolean = true;

	onClicked: ((self: Circuit) => void) | undefined = undefined;

	private constructor(
		public parentCircuit: Circuit,
		public posWrl: Vec2,
		public ctx: CanvasRenderingContext2D | undefined = undefined
	) {
		this.label = parentCircuit.props.label;
		// if (ctx != null) {
		// 	this.headRectWrl = this.getHeadRectWrl();
		// } else {
		// 	this.headRectWrl = new Rect(0, 0, 0, 0);
		// }

		this.bodyRectWrl = this.getBodyRectWrl();

		this.tightRectWrl = this.calcTightRect();
		this.looseRectWrl = this.calcLooseRect();
		this.parentScene = new Scene();
	}

	static newWithID(
		id: ID,
		parentCircuit: Circuit,
		posWrl: Vec2,
		parentScene: Scene | undefined = undefined,
		ctx: CanvasRenderingContext2D
	) {
		const sceneObject = new CircuitSceneObject(parentCircuit, posWrl, ctx);

		if (parentScene == null) {
			sceneObject.parentScene = sceneManager.getCurrentScene();
		} else {
			sceneObject.parentScene = parentScene;
		}
		sceneObject.parentScene.registerCircuitWithID(id, sceneObject);
		parentCircuit.sceneObject = sceneObject;
		parentCircuit.onSceneObjectConfigured();
		return sceneObject;
	}

	static new(
		parentCircuit: Circuit,
		posWrl: Vec2,
		parentScene: Scene | undefined = undefined,
		ctx: CanvasRenderingContext2D
	) {
		const sceneObject = new CircuitSceneObject(parentCircuit, posWrl, ctx);

		if (parentScene == null) {
			sceneObject.parentScene = sceneManager.getCurrentScene();
		} else {
			sceneObject.parentScene = parentScene;
		}
		sceneObject.parentScene.registerCircuit(sceneObject);
		parentCircuit.sceneObject = sceneObject;
		parentCircuit.onSceneObjectConfigured();
		return sceneObject;
	}

	static dummy() {
		return new CircuitSceneObject(dummyCircuit(), new Vec2(0, 0));
	}

	private calcTightRect() {
		return new Rect(this.posWrl.x, this.posWrl.y, this.bodyRectWrl.w, this.bodyRectWrl.h);
	}

	getLabelMetrics() {
		if (this.ctx == null) {
			return new Rect(0, 0, 0, 0);
		}

		this.ctx.font = `bold ${CircuitSceneObject.labelTextSizeWrl}px "Advent Pro"`;
		let actualLabel: string;
		if (this.label === this.parentCircuit.circuitType) {
			actualLabel = this.label;
		} else {
			actualLabel = `${this.label}(${this.parentCircuit.circuitType})`;
		}

		const metrics = this.ctx.measureText(actualLabel);

		const labelHeight =
			Math.abs(metrics.actualBoundingBoxAscent) + Math.abs(metrics.actualBoundingBoxDescent);

		const labelWidth =
			Math.abs(metrics.actualBoundingBoxLeft) + Math.abs(metrics.actualBoundingBoxRight);

		return new Rect(0, 0, labelWidth, labelHeight);
	}

	// private getHeadRectWrl() {
	// 	if (this.ctx == null) {
	// 		return new Rect(0, 0, 0, 0);
	// 	}

	// 	this.ctx.font = `bold ${CircuitSceneObject.labelTextSizeWrl}px "Advent Pro"`;
	// 	let actualLabel: string;
	// 	if (this.label === this.parentCircuit.circuitType) {
	// 		actualLabel = this.label;
	// 	} else {
	// 		actualLabel = `${this.label}(${this.parentCircuit.circuitType})`;
	// 	}
	// 	const metrics = this.ctx.measureText(actualLabel);

	// 	const labelHeight =
	// 		Math.abs(metrics.actualBoundingBoxAscent) + Math.abs(metrics.actualBoundingBoxDescent);
	// 	const headHeight = labelHeight + 2 * CircuitSceneObject.headPaddingYWrl;

	// 	const labelWidth =
	// 		Math.abs(metrics.actualBoundingBoxLeft) + Math.abs(metrics.actualBoundingBoxRight);
	// 	const headWidth = Math.max(
	// 		labelWidth + 2 * CircuitSceneObject.paddingXWrl,
	// 		CircuitSceneObject.minWidthWrl
	// 	);

	// 	return new Rect(this.posWrl.x, this.posWrl.y, headWidth, headHeight);
	// }

	private getBodyRectWrl() {
		const maxPinNumber = Math.max(
			this.parentCircuit.consumerPins.length,
			this.parentCircuit.producerPins.length
		);

		const metrics = this.getLabelMetrics();

		return new Rect(
			this.posWrl.x,
			this.posWrl.y,
			Math.max(metrics.w + 2 * CircuitSceneObject.paddingXWrl, CircuitSceneObject.minWidthWrl),

			Math.max(
				CircuitSceneObject.paddingYWrl * 2 +
					maxPinNumber * 2 * CircuitSceneObject.pinRadiusWrl +
					(maxPinNumber - 1) * PIN_TO_PIN_DISTANCE_WRL,
				CircuitSceneObject.paddingYWrl * 2 + metrics.h
			)
		);
	}

	private calcLooseRect() {
		const pPinExtrusion = this.parentCircuit.producerPins.length === 0 ? 0 : PIN_EXTRUSION_WRL;
		const cPinExtrusion = this.parentCircuit.consumerPins.length === 0 ? 0 : PIN_EXTRUSION_WRL;
		return new Rect(
			this.tightRectWrl.x - cPinExtrusion - 3,
			this.tightRectWrl.y - 3,
			this.tightRectWrl.w + cPinExtrusion + pPinExtrusion + 6,
			this.tightRectWrl.h + 6
		);
	}

	looseCollisionCheck(pointWrl: Vec2) {
		const res = this.looseRectWrl.pointIntersection(pointWrl);
		if (res) {
			console.log('Loose Collision Passed');
		}
		return res;
	}

	tightCollisionCheck(pointWrl: Vec2):
		| {
				kind: ConcreteObjectKind;
				object: Circuit | ProducerPin | ConsumerPin;
		  }
		| undefined {
		for (const pin of this.parentCircuit.consumerPins) {
			if (pin.pointCollision(pointWrl)) {
				console.log('Tight Collision Passed');
				return { kind: ConcreteObjectKind.ConsumerPin, object: pin };
			}
		}

		for (const pin of this.parentCircuit.producerPins) {
			if (pin.pointCollision(pointWrl)) {
				console.log('Tight Collision Passed');
				return { kind: ConcreteObjectKind.ProducerPin, object: pin };
			}
		}

		if (this.tightRectWrl.pointIntersection(pointWrl)) {
			console.log('Tight Collision Passed');
			return { kind: ConcreteObjectKind.Circuit, object: this.parentCircuit };
		}

		return undefined;
	}

	calcRects() {
		// this.headRectWrl = this.getHeadRectWrl();

		this.bodyRectWrl = this.getBodyRectWrl();
		this.tightRectWrl = this.calcTightRect();
		this.looseRectWrl = this.calcLooseRect();
	}

	setPos(posWrl: Vec2) {
		this.posWrl = posWrl;
		this.calcRects();
	}

	refreshLabel() {
		this.label = this.parentCircuit.props.label;
		// this.label = label;
		this.calcRects();
	}

	draw(ctx: CanvasRenderingContext2D) {
		const labelMetrics = view.worldToScreenRect(this.getLabelMetrics());
		const bodyRectScr = view.worldToScreenRect(this.bodyRectWrl);
		const looseRectScr = view.worldToScreenRect(this.looseRectWrl);

		// Label
		const labelSizeScr = CircuitSceneObject.labelTextSizeWrl * view.zoomLevel;
		ctx.font = `bold ${labelSizeScr}px "Advent Pro"`;
		ctx.textBaseline = 'bottom';

		let actualLabel: string;
		if (this.label === this.parentCircuit.circuitType) {
			actualLabel = this.label;
		} else {
			actualLabel = `${this.label}(${this.parentCircuit.circuitType})`;
		}

		//render Body
		// Head and Body separator
		const separatorWidth = 1 * view.zoomLevel;
		ctx.lineWidth = separatorWidth;
		ctx.strokeStyle = '#1e1e1e';
		ctx.beginPath();
		ctx.moveTo(bodyRectScr.x, bodyRectScr.y);
		ctx.lineTo(bodyRectScr.x + bodyRectScr.w, bodyRectScr.y);
		ctx.stroke();

		ctx.fillStyle = circuitColor;
		ctx.beginPath();
		ctx.roundRect(bodyRectScr.x, bodyRectScr.y, bodyRectScr.w, bodyRectScr.h, [4, 4, 4, 4]);
		ctx.fill();

		ctx.fillStyle = 'white';
		const remainingBodySpaceY =
			bodyRectScr.h - (labelMetrics.h + CircuitSceneObject.paddingYWrl * view.zoomLevel * 2);
		const remainingBodySpaceX =
			bodyRectScr.w - (labelMetrics.w + CircuitSceneObject.paddingXWrl * view.zoomLevel * 2);
		ctx.fillText(
			actualLabel,
			bodyRectScr.x + CircuitSceneObject.paddingXWrl * view.zoomLevel + remainingBodySpaceX / 2,
			bodyRectScr.y +
				bodyRectScr.h -
				CircuitSceneObject.paddingYWrl * view.zoomLevel -
				remainingBodySpaceY / 2
		);

		if (this.isSelected) {
			ctx.lineWidth = 1;
			ctx.strokeStyle = ornamentColor;

			ctx.strokeRect(looseRectScr.x, looseRectScr.y, looseRectScr.w, looseRectScr.h);
		}

		for (const pin of this.parentCircuit.consumerPins) {
			pin.draw(ctx);
		}
		for (const pin of this.parentCircuit.producerPins) {
			pin.draw(ctx);
		}
	}
}
