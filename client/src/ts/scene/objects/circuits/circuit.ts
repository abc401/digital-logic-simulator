import { Vec2 } from '@ts/math.js';
// import { Scene } from '@ts/scene/scene.js';
import { SimEvent, UpdationStrategy } from '@ts/engine.js';
import { ConsumerPin } from '../consumer-pin.js';
import { ProducerPin } from '../producer-pin.js';
import { Wire } from '../wire.js';
import { simEngine } from '@routes/+page.svelte';
import { CircuitSceneObject, Scene } from '@ts/scene/scene.js';

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

function identitiyPropSetter(name: string) {
	return function (circuit: Circuit, value: any) {
		circuit.props[name] = value;
		return true;
	};
}

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
	configSceneObject(posWrl: Vec2, scene: Scene | undefined, ctx: CanvasRenderingContext2D): void;
}

export function dummyCircuit() {
	let circuit: Circuit = {
		consumerPins: [],
		producerPins: [],

		props: { label: 'Dummy' },
		propTypes: {},
		propSetters: {},

		updateHandeler: () => {},

		updationStrategy: UpdationStrategy.InNextFrame,
		inputWireUpdationStrategy: UpdationStrategy.InNextFrame,
		outputWireUpdationStrategy: UpdationStrategy.InNextFrame,
		simFrameAllocated: true,

		sceneObject: undefined,
		configSceneObject: () => {},
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

	let circuit = start;
	let cloned = circuit.clone();

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

	let wire = start;
	let cloned = wire.clone();

	clonedWires.push(cloned);
	wireCloneMapping.set(wire, cloned);

	if (wire.consumerPin != null) {
		let consumerCircuit = cloneGraphAfterCircuit(
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
		let producerCircuit = cloneGraphAfterCircuit(
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
	for (let pin of circuit.consumerPins) {
		if (pin.wire != undefined) {
			nConnectedPins += 1;
		}
	}
	console.log('nConnectedPins: ', nConnectedPins);
	if (nConnectedPins > nConsumerPins) {
		return false;
	}
	let newPins = new Array<ConsumerPin>(nConsumerPins);
	let pinIndex = 0;
	for (let pin of circuit.consumerPins) {
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
