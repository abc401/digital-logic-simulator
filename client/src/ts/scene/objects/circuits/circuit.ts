import { Vec2, Rect } from '@ts/math.js';
import { ConcreteObjectKind } from '@ts/scene/scene-manager.js';
import { Scene } from '@ts/scene/scene.js';
import { SimEvent, UpdationStrategy } from '@ts/engine.js';
import { ConsumerPin } from '../consumer-pin.js';
import { ProducerPin } from '../producer-pin.js';
import { PIN_EXTRUSION_WRL, PIN_TO_PIN_DISTANCE_WRL } from '@ts/config.js';
import { Wire } from '../wire.js';
import { sceneManager, simEngine, viewManager } from '@routes/+page.svelte';

export type CircuitUpdateHandeler = (self: Circuit) => void;

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

export interface Circuit {
	consumerPins: ConsumerPin[];
	producerPins: ProducerPin[];
	updateHandeler: CircuitUpdateHandeler;

	updationStrategy: UpdationStrategy;
	inputWireUpdationStrategy: UpdationStrategy;
	outputWireUpdationStrategy: UpdationStrategy;

	simFrameAllocated: boolean;

	sceneObject: CircuitSceneObject | undefined;

	clone(): Circuit;
	configSceneObject(pos: Vec2, scene: Scene | undefined): void;
}

export class CircuitSceneObject {
	// id: number;
	parentScene: Scene;

	tightRectWrl: Rect;
	looseRectWrl: Rect;

	isSelected = false;

	onClicked: ((self: Circuit) => void) | undefined = undefined;

	private constructor(
		public parentCircuit: Circuit,
		pos: Vec2
	) {
		this.tightRectWrl = this.calcTightRect(pos);
		this.looseRectWrl = this.calcLooseRect(this.tightRectWrl);
		this.parentScene = new Scene();
	}

	static new(parentCircuit: Circuit, pos: Vec2, parentScene: Scene | undefined = undefined) {
		let sceneObject = new CircuitSceneObject(parentCircuit, pos);

		if (parentScene == null) {
			sceneObject.parentScene = sceneManager.getCurrentScene();
		} else {
			sceneObject.parentScene = parentScene;
		}
		// sceneObject.id = sceneManager.currentScene.registerCircuit(this);
		sceneObject.parentScene.registerCircuit(sceneObject);
		return sceneObject;
	}

	private calcTightRect(pos: Vec2) {
		const nConsumerPins = this.parentCircuit.consumerPins.length;
		const nProducerPins = this.parentCircuit.producerPins.length;

		let higherPinNumber = nConsumerPins > nProducerPins ? nConsumerPins : nProducerPins;
		if (higherPinNumber <= 0) {
			higherPinNumber = 1;
		}

		return new Rect(
			pos.x,
			pos.y,
			100,
			(ConsumerPin.radiusWrl * 2 + PIN_TO_PIN_DISTANCE_WRL) * (higherPinNumber - 1) +
				ConsumerPin.radiusWrl * 2
		);
	}

	private calcLooseRect(tightRectWrl: Rect) {
		const pPinExtrusion = this.parentCircuit.producerPins.length === 0 ? 0 : PIN_EXTRUSION_WRL;
		const cPinExtrusion = this.parentCircuit.consumerPins.length === 0 ? 0 : PIN_EXTRUSION_WRL;
		return new Rect(
			tightRectWrl.x - cPinExtrusion - 3,
			tightRectWrl.y - 3,
			tightRectWrl.w + cPinExtrusion + pPinExtrusion + 6,
			tightRectWrl.h + 6
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
				object: any;
		  }
		| undefined {
		if (this.tightRectWrl.pointIntersection(pointWrl)) {
			console.log('Tight Collision Passed');
			return { kind: ConcreteObjectKind.Circuit, object: this.parentCircuit };
		}

		for (let pin of this.parentCircuit.consumerPins) {
			if (pin.pointCollision(pointWrl)) {
				console.log('Tight Collision Passed');
				return { kind: ConcreteObjectKind.ConsumerPin, object: pin };
			}
		}

		for (let pin of this.parentCircuit.producerPins) {
			if (pin.pointCollision(pointWrl)) {
				console.log('Tight Collision Passed');
				return { kind: ConcreteObjectKind.ProducerPin, object: pin };
			}
		}

		return undefined;
	}

	calcRects() {
		const pos = this.tightRectWrl.xy;

		this.tightRectWrl = this.calcTightRect(pos);
		this.looseRectWrl = this.calcLooseRect(this.tightRectWrl);
	}

	setPos(posWrl: Vec2) {
		this.tightRectWrl.xy = posWrl;
		this.looseRectWrl = this.calcLooseRect(this.tightRectWrl);
	}

	draw(ctx: CanvasRenderingContext2D) {
		const tightRectScr = viewManager.worldToScreenRect(this.tightRectWrl);
		ctx.fillStyle = 'cyan';
		ctx.strokeStyle = 'black';
		ctx.lineWidth = 1;

		ctx.fillRect(tightRectScr.x, tightRectScr.y, tightRectScr.w, tightRectScr.h);
		ctx.strokeRect(tightRectScr.x, tightRectScr.y, tightRectScr.w, tightRectScr.h);
		for (let i = 0; i < this.parentCircuit.consumerPins.length; i++) {
			this.parentCircuit.consumerPins[i].draw(ctx);
		}
		for (let i = 0; i < this.parentCircuit.producerPins.length; i++) {
			this.parentCircuit.producerPins[i].draw(ctx);
		}

		if (this.isSelected) {
			const looseRectScr = viewManager.worldToScreenRect(this.looseRectWrl);
			ctx.strokeStyle = 'green';
			ctx.strokeRect(looseRectScr.x, looseRectScr.y, looseRectScr.w, looseRectScr.h);
		}
	}
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
