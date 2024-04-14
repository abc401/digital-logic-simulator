import { Rect, Vec2 } from '@ts/math.js';
// import { Scene } from '@ts/scene/scene.js';
import { SimEvent, UpdationStrategy } from '@ts/engine.js';
import { ConsumerPin } from '../consumer-pin.js';
import { ProducerPin } from '../producer-pin.js';
import { Wire } from '../wire.js';
import {
	circuitColor,
	ornamentColor,
	sceneManager,
	simEngine,
	viewManager
} from '@routes/+page.svelte';
import { Scene } from '@ts/scene/scene.js';
// import { CircuitSceneObject } from './circuit.js';
// import { CircuitSceneObject } from './circuit.js';
import type { ID } from '../../scene.js';
import { PIN_EXTRUSION_WRL, PIN_TO_PIN_DISTANCE_WRL } from '@src/ts/config.js';
import { ConcreteObjectKind } from '../../scene-manager.js';
import type { UserAction } from '@src/ts/interactivity/actions-manager.js';
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
		circuit.props.label = value.trim();
		if (circuit.sceneObject != null) {
			circuit.sceneObject.setLabel(circuit.props.label);
		}
		return true;
	}
};

export interface Circuit {
	props: Props;
	propTypes: PropTypes;
	propSetters: PropSetters;

	// setProp(name: number, value: any, a: number): boolean;

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

// class CircuitColliderObject implements ColliderObject {
//   constructor(public circuit: Circuit) {}

//   looseCollisionCheck(pointWrl: Vec2) {
//     if (this.circuit.sceneObject == null) {
//       throw Error();
//     }
//     const res =
//       this.circuit.sceneObject.looseRectWrl.pointIntersection(pointWrl);
//     if (res) {
//       console.log("Loose Collision Passed");
//     }
//     return res;
//   }

//   tightCollisionCheck(pointWrl: Vec2):
//     | {
//         kind: ConcreteObjectKind;
//         object: any;
//       }
//     | undefined {
//     if (this.circuit.sceneObject == null) {
//       throw Error();
//     }

//     if (this.circuit.sceneObject.tightRectWrl.pointIntersection(pointWrl)) {
//       console.log("Tight Collision Passed");
//       return { kind: ConcreteObjectKind.Circuit, object: this.circuit };
//     }

//     for (let pin of this.circuit.consumerPins) {
//       if (pin.pointCollision(pointWrl)) {
//         console.log("Tight Collision Passed");
//         return { kind: ConcreteObjectKind.ConsumerPin, object: pin };
//       }
//     }

//     for (let pin of this.circuit.producerPins) {
//       if (pin.pointCollision(pointWrl)) {
//         console.log("Tight Collision Passed");
//         return { kind: ConcreteObjectKind.ProducerPin, object: pin };
//       }
//     }

//     return undefined;
//   }
// }

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

export class CreateCircuitUserAction implements UserAction {
	name = '';

	readonly sceneObjectID: ID;
	constructor(private parentCircuit: Circuit) {
		this.sceneObjectID = sceneManager.getCurrentScene().getNextID();
	}

	do(): void {}
	undo(): void {}
}

export class CircuitSceneObject {
	id: ID | undefined;
	parentScene: Scene;

	tightRectWrl: Rect;
	looseRectWrl: Rect;
	headRectWrl: Rect;
	bodyRectWrl: Rect;

	static minWidthWrl = 100;
	static headPaddingYWrl = 10;
	static paddingXWrl = 10;
	static bodyPaddingYWrl = 15;
	static pinRadiusWrl = PIN_EXTRUSION_WRL;
	static labelTextSizeWrl = 10;

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
		if (ctx != null) {
			this.headRectWrl = this.getHeadRectWrl();
		} else {
			this.headRectWrl = new Rect(0, 0, 0, 0);
		}

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
		return new Rect(
			this.posWrl.x,
			this.posWrl.y,
			this.headRectWrl.w,
			this.headRectWrl.h + this.bodyRectWrl.h
		);
	}

	private getHeadRectWrl() {
		if (this.ctx == null) {
			return new Rect(0, 0, 0, 0);
		}

		this.ctx.font = `bold ${CircuitSceneObject.labelTextSizeWrl}px "Advent Pro"`;
		const metrics = this.ctx.measureText(this.label);

		const labelHeight =
			Math.abs(metrics.actualBoundingBoxAscent) + Math.abs(metrics.actualBoundingBoxDescent);
		const headHeight = labelHeight + 2 * CircuitSceneObject.headPaddingYWrl;

		const labelWidth =
			Math.abs(metrics.actualBoundingBoxLeft) + Math.abs(metrics.actualBoundingBoxRight);
		const headWidth = Math.max(
			labelWidth + 2 * CircuitSceneObject.paddingXWrl,
			CircuitSceneObject.minWidthWrl
		);

		return new Rect(this.posWrl.x, this.posWrl.y, headWidth, headHeight);
	}

	private getBodyRectWrl() {
		const maxPinNumber = Math.max(
			this.parentCircuit.consumerPins.length,
			this.parentCircuit.producerPins.length
		);

		return new Rect(
			this.posWrl.x,
			this.posWrl.y + this.headRectWrl.h,
			this.headRectWrl.w,

			CircuitSceneObject.bodyPaddingYWrl * 2 +
				maxPinNumber * 2 * CircuitSceneObject.pinRadiusWrl +
				(maxPinNumber - 1) * PIN_TO_PIN_DISTANCE_WRL
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
		this.headRectWrl = this.getHeadRectWrl();

		this.bodyRectWrl = this.getBodyRectWrl();
		this.tightRectWrl = this.calcTightRect();
		this.looseRectWrl = this.calcLooseRect();
	}

	setPos(posWrl: Vec2) {
		this.posWrl = posWrl;
		this.calcRects();
	}

	setLabel(label: string) {
		this.label = label;
		this.calcRects();
	}

	draw(ctx: CanvasRenderingContext2D) {
		const headRectScr = viewManager.worldToScreenRect(this.headRectWrl);
		const bodyRectScr = viewManager.worldToScreenRect(this.bodyRectWrl);
		const looseRectScr = viewManager.worldToScreenRect(this.looseRectWrl);

		// Head background
		ctx.fillStyle = circuitColor;
		ctx.beginPath();
		ctx.roundRect(headRectScr.x, headRectScr.y, headRectScr.w, headRectScr.h, [4, 4, 0, 0]);
		ctx.fill();

		// Label
		const labelSizeScr = CircuitSceneObject.labelTextSizeWrl * viewManager.zoomLevel;
		ctx.font = `bold ${labelSizeScr}px "Advent Pro"`;
		ctx.fillStyle = '#fff';
		ctx.textBaseline = 'bottom';
		ctx.fillText(
			this.label,
			headRectScr.x + CircuitSceneObject.paddingXWrl * viewManager.zoomLevel,
			headRectScr.y + headRectScr.h - CircuitSceneObject.headPaddingYWrl * viewManager.zoomLevel
		);

		//render Body
		// Head and Body separator
		const separatorWidth = 1 * viewManager.zoomLevel;
		ctx.lineWidth = separatorWidth;
		ctx.strokeStyle = '#1e1e1e';
		ctx.beginPath();
		ctx.moveTo(bodyRectScr.x, bodyRectScr.y);
		ctx.lineTo(bodyRectScr.x + bodyRectScr.w, bodyRectScr.y);
		ctx.stroke();

		ctx.fillStyle = circuitColor;
		ctx.beginPath();
		ctx.roundRect(bodyRectScr.x, bodyRectScr.y, bodyRectScr.w, bodyRectScr.h, [0, 0, 4, 4]);
		ctx.fill();

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
