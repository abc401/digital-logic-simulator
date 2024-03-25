import { Vec2, Rect } from '@ts/math.js';
import { ConcreteObjectKind, debugObjects } from '../scene-manager.js';
import { Scene } from '../scene.js';
import { SimEvent, UpdationStrategy } from '@ts/engine.js';
import { ConsumerPin } from './consumer-pin.js';
import { ProducerPin } from './producer-pin.js';
import { PIN_EXTRUSION_WRL, PIN_TO_PIN_DISTANCE_WRL } from '@ts/config.js';
import { Wire } from './wire.js';
import { sceneManager, simEngine, viewManager } from '@routes/+page.svelte';

type CircuitUpdateHandeler = (self: Circuit) => void;

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

function circuitCloneHelper(circuit: Circuit) {
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

export class InputCircuit implements Circuit {
	updationStrategy = UpdationStrategy.InNextFrame;
	inputWireUpdationStrategy = UpdationStrategy.InNextFrame;
	outputWireUpdationStrategy = UpdationStrategy.InNextFrame;

	simFrameAllocated = false;

	consumerPins: ConsumerPin[];
	producerPins: ProducerPin[];

	sceneObject: CircuitSceneObject | undefined;

	constructor(public value: boolean) {
		this.sceneObject = undefined;

		this.consumerPins = new Array();

		this.producerPins = Array(1);
		for (let i = 0; i < this.producerPins.length; i++) {
			this.producerPins[i] = new ProducerPin(this, i);
		}

		this.updateHandeler(this);

		simEngine.recurringEvents.push(new SimEvent(this, this.updateHandeler));
	}

	updateHandeler(self_: Circuit) {
		let self = self_ as InputCircuit;
		self.producerPins[0].setValue(self.value);
	}

	clone(): Circuit {
		return circuitCloneHelper(this);
	}

	configSceneObject(pos: Vec2, scene: Scene | undefined = undefined): void {
		this.sceneObject = CircuitSceneObject.new(this, pos, scene);
		this.sceneObject.onClicked = InputCircuit.onClicked;
	}

	static onClicked(self_: Circuit) {
		let self = self_ as InputCircuit;
		self.value = !self.value;
		self.producerPins[0].setValue(self.value);
	}

	// prodPinLocWrl(pinIndex: number) {
	//   return new Vec2(
	//     this.rectWrl.x + this.rectWrl.w,
	//     this.rectWrl.y + pinIndex * Circuit.pinToPinDist
	//   );
	// }

	// prodPinLocScr(pinIndex: number) {
	//   const rect = this.screenRect();
	//   return new Vec2(
	//     rect.x + rect.w,
	//     rect.y + pinIndex * Circuit.pinToPinDist * viewManager.zoomLevel
	//   );
	// }

	// conPinLocScr(pinIndex: number) {
	//   return viewManager.worldToScreen(
	//     new Vec2(this.rectWrl.x, this.rectWrl.y + pinIndex * 70)
	//   );
	//   // pos.x * zoomScale + panOffset.x,
	//   // pos.y * zoomScale + panOffset.y,
	//   // ConsumerPin.radius * zoomScale,
	//   // 0,
	//   // 2 * Math.PI
	// }

	// getVirtualObject() {
	//   return new VirtualObject(ConcreteObjectKind.Circuit, this, this.rectWrl);
	// }

	// screenRect() {
	//   return new Rect(
	//     this.rectWrl.x * viewManager.zoomLevel + viewManager.panOffset.x,
	//     this.rectWrl.y * viewManager.zoomLevel + viewManager.panOffset.y,
	//     Circuit.width * viewManager.zoomLevel,
	//     (this.consumerPins.length > this.producerPins.length
	//       ? this.consumerPins.length * 70
	//       : this.producerPins.length * 70) * viewManager.zoomLevel
	//   );
	// }
}

export class ProcessingCircuit implements Circuit {
	simFrameAllocated = false;

	updationStrategy = UpdationStrategy.InNextFrame;

	inputWireUpdationStrategy = UpdationStrategy.InNextFrame;
	outputWireUpdationStrategy = UpdationStrategy.InNextFrame;

	updateHandeler: CircuitUpdateHandeler;

	consumerPins: ConsumerPin[];
	producerPins: ProducerPin[];

	sceneObject: CircuitSceneObject | undefined;

	constructor(nConsumerPins: number, nProducerPins: number, updateHandeler: CircuitUpdateHandeler) {
		this.sceneObject = undefined;

		this.producerPins = new Array(nProducerPins);
		for (let i = 0; i < nProducerPins; i++) {
			this.producerPins[i] = new ProducerPin(this, i);
		}

		this.consumerPins = new Array(nConsumerPins);
		for (let i = 0; i < nConsumerPins; i++) {
			this.consumerPins[i] = new ConsumerPin(this, i);
		}

		this.updateHandeler = updateHandeler;

		this.updateHandeler(this);
	}

	configSceneObject(pos: Vec2, scene: Scene | undefined = undefined): void {
		this.sceneObject = CircuitSceneObject.new(this, pos, scene);
	}

	clone(): Circuit {
		return circuitCloneHelper(this);
	}
}

export class CustomCircuitInputs implements Circuit {
	simFrameAllocated = false;

	inputWireUpdationStrategy = UpdationStrategy.Immediate;
	outputWireUpdationStrategy = UpdationStrategy.Immediate;
	updationStrategy = UpdationStrategy.Immediate;

	consumerPins: ConsumerPin[];
	producerPins: ProducerPin[];

	sceneObject: CircuitSceneObject | undefined;

	updateHandeler = () => {};

	constructor() {
		this.sceneObject = undefined;

		this.consumerPins = new Array();

		this.producerPins = Array(1);

		for (let i = 0; i < this.producerPins.length; i++) {
			this.producerPins[i] = new ProducerPin(this, i);
		}

		let producerPin = this.producerPins[0];
		producerPin.onWireAttached = CustomCircuitInputs.addPin;
	}

	clone(): Circuit {
		return circuitCloneHelper(this);
	}

	configSceneObject(pos: Vec2, scene: Scene | undefined = undefined): void {
		let parentScene = scene || sceneManager.getCurrentScene();
		if (parentScene.customCircuitInputs != null) {
			throw Error();
		}

		this.sceneObject = CircuitSceneObject.new(this, pos, scene);
		// sceneManager.currentScene.customCircuitInputs = this.sceneObject.id;
		parentScene.customCircuitInputs = this;
	}

	setValues(pins: ConsumerPin[]) {
		for (let i = 0; i < this.producerPins.length - 1; i++) {
			// this.producerPins[i].setValue(pins[i].value);
			this.producerPins[i].value = pins[i].value;
			for (let wire of this.producerPins[i].wires) {
				Wire.update(wire);
			}
		}
	}

	static addPin(self: CustomCircuitInputs) {
		const newPinIndex = self.producerPins.length;
		let currentLastPin = self.producerPins[newPinIndex - 1];
		currentLastPin.onWireAttached = () => {};
		let newPin = new ProducerPin(self, newPinIndex);
		newPin.onWireAttached = CustomCircuitInputs.addPin;
		self.producerPins.push(newPin);

		if (self.sceneObject != null) {
			self.sceneObject.calcRects();
		}

		// console.log("Adding Pin");
		// console.log("New pin: ", newPin);
		// console.log("All pins: ", self.producerPins);
	}
}

export class CustomCircuitOutputs implements Circuit {
	updationStrategy = UpdationStrategy.Immediate;
	inputWireUpdationStrategy = UpdationStrategy.Immediate;
	outputWireUpdationStrategy = UpdationStrategy.Immediate;

	simFrameAllocated = false;

	consumerPins: ConsumerPin[];
	producerPins: ProducerPin[];

	customCircuitProducerPins: ProducerPin[] | undefined;

	sceneObject: CircuitSceneObject | undefined;

	constructor() {
		this.sceneObject = undefined;
		const nConsumerPins = 1;
		const nProducerPins = 0;

		this.consumerPins = new Array(nConsumerPins);

		this.producerPins = Array(nProducerPins);

		for (let i = 0; i < this.consumerPins.length; i++) {
			this.consumerPins[i] = new ConsumerPin(this, i);
		}

		let consumerPin = this.consumerPins[0];
		consumerPin.onWireAttached = CustomCircuitOutputs.addPin;
	}

	clone(): Circuit {
		let cloned = circuitCloneHelper(this) as CustomCircuitOutputs;
		cloned.customCircuitProducerPins = undefined;
		return cloned;
	}

	updateHandeler(self: Circuit) {
		let circuit = self as CustomCircuitOutputs;
		if (circuit.customCircuitProducerPins == null) {
			console.log('circuit.customCircuitProducerPins == null');
			return;
		}
		for (let i = 0; i < circuit.consumerPins.length - 1; i++) {
			circuit.customCircuitProducerPins[i].setValue(circuit.consumerPins[i].value);
		}
	}

	configSceneObject(pos: Vec2, scene: Scene | undefined = undefined): void {
		let parentScene = scene || sceneManager.getCurrentScene();
		if (parentScene.customCircuitOutputs != null) {
			throw Error();
		}

		this.sceneObject = CircuitSceneObject.new(this, pos, scene);
		// sceneManager.currentScene.customCircuitOutputs = this.sceneObject.id;
		parentScene.customCircuitOutputs = this;
	}

	static addPin(self: CustomCircuitOutputs) {
		const newPinIndex = self.consumerPins.length;
		let currentLastPin = self.consumerPins[newPinIndex - 1];
		currentLastPin.onWireAttached = () => {};

		let newPin = new ConsumerPin(self, newPinIndex);
		newPin.onWireAttached = CustomCircuitOutputs.addPin;
		self.consumerPins.push(newPin);
		if (self.sceneObject != null) {
			self.sceneObject.calcRects();
		}

		// console.log("Adding Pin");
		// console.log("New pin: ", newPin);
		// console.log("All pins: ", self.producerPins);
	}
}

export class CustomCircuit implements Circuit {
	updationStrategy = UpdationStrategy.Immediate;
	inputWireUpdationStrategy = UpdationStrategy.InNextFrame;
	outputWireUpdationStrategy = UpdationStrategy.InNextFrame;

	isSelected: boolean = false;
	simFrameAllocated = false;

	consumerPins: ConsumerPin[];
	producerPins: ProducerPin[];

	circuits: Circuit[];
	wires: Wire[];

	sceneObject: CircuitSceneObject | undefined;

	customInputs: CustomCircuitInputs;
	customOutputs: CustomCircuitOutputs;

	// scene: Scene;

	constructor(public scene: Scene) {
		this.sceneObject = undefined;
		this.circuits = [];
		this.wires = [];

		let circuitCloneMapping = new Map<Circuit, Circuit>();
		let wireCloneMapping = new Map<Wire, Wire>();

		for (let circuit of this.scene.circuits.topToBottom()) {
			cloneGraphAfterCircuit(
				circuit.data.parentCircuit,
				this.circuits,
				this.wires,
				circuitCloneMapping,
				wireCloneMapping
			);
		}

		if (this.scene.customCircuitInputs == null) {
			throw Error();
		}
		const newCustomInputs = circuitCloneMapping.get(this.scene.customCircuitInputs);
		if (newCustomInputs == null) {
			throw Error();
		}
		this.customInputs = newCustomInputs as CustomCircuitInputs;

		if (this.scene.customCircuitOutputs == null) {
			throw Error();
		}
		const newCustomOutputs = circuitCloneMapping.get(this.scene.customCircuitOutputs);
		if (newCustomOutputs == null) {
			throw Error();
		}
		this.customOutputs = newCustomOutputs as CustomCircuitOutputs;

		const nConsumerPins = this.customInputs.producerPins.length - 1;
		const nProducerPins = this.customOutputs.consumerPins.length - 1;

		this.producerPins = new Array<ProducerPin>(nProducerPins);
		for (let i = 0; i < nProducerPins; i++) {
			this.producerPins[i] = new ProducerPin(this, i, this.customOutputs.consumerPins[i].value);
		}

		this.consumerPins = new Array<ConsumerPin>(nConsumerPins);
		for (let i = 0; i < nConsumerPins; i++) {
			this.consumerPins[i] = new ConsumerPin(this, i);
		}

		this.customOutputs.customCircuitProducerPins = this.producerPins;

		console.log('CustomCircuit.constructor: ', this);
	}

	updateCircuitGraph() {
		this.circuits = [];
		this.wires = [];

		let circuitCloneMapping = new Map<Circuit, Circuit>();
		let wireCloneMapping = new Map<Wire, Wire>();

		for (let circuit of this.scene.circuits.topToBottom()) {
			cloneGraphAfterCircuit(
				circuit.data.parentCircuit,
				this.circuits,
				this.wires,
				circuitCloneMapping,
				wireCloneMapping
			);
		}

		if (this.scene.customCircuitInputs == null) {
			throw Error();
		}

		const newCustomInputs = circuitCloneMapping.get(this.scene.customCircuitInputs);
		if (newCustomInputs == null) {
			throw Error();
		}
		this.customInputs = newCustomInputs as CustomCircuitInputs;

		if (this.scene.customCircuitOutputs == null) {
			throw Error();
		}
		const newCustomOutputs = circuitCloneMapping.get(this.scene.customCircuitOutputs);
		if (newCustomOutputs == null) {
			throw Error();
		}
		this.customOutputs = newCustomOutputs as CustomCircuitOutputs;

		const nConsumerPins = this.customInputs.producerPins.length - 1;
		const nProducerPins = this.customOutputs.consumerPins.length - 1;

		if (nConsumerPins < this.consumerPins.length) {
			throw Error('Update this pls');
		}
		if (nProducerPins < this.producerPins.length) {
			throw Error('Update this pls');
		}

		if (nConsumerPins > this.consumerPins.length) {
			for (let i = this.consumerPins.length; i < nConsumerPins; i++) {
				this.consumerPins.push(new ConsumerPin(this, i));
			}
		}

		if (nProducerPins > this.producerPins.length) {
			for (let i = this.producerPins.length; i < nProducerPins; i++) {
				this.producerPins.push(new ProducerPin(this, i));
			}
		}

		this.customOutputs.customCircuitProducerPins = this.producerPins;

		if (this.sceneObject != null) {
			this.sceneObject.calcRects();
		}
		this.updateHandeler(this);
		console.log('CustomCircuit.constructor: ', this);
	}

	configSceneObject(pos: Vec2, targetScene: Scene | undefined = undefined): void {
		if (targetScene == null) {
			targetScene = sceneManager.getCurrentScene();
		}

		this.sceneObject = CircuitSceneObject.new(this, pos, targetScene);
		let entry = targetScene.customCircuitInstances.get(this.scene.name);
		if (entry == null) {
			entry = {
				instances: new Set(),
				lastUpdateIdx: this.scene.lastUpdateIdx
			};
		}
		entry.instances.add(this);

		targetScene.customCircuitInstances.set(this.scene.name, entry);

		console.log(
			`CustomCircuitInstances for ${targetScene.name}: `,
			targetScene.customCircuitInstances
		);

		this.sceneObject.onClicked = this.onClicked;
	}

	onClicked(self_: Circuit) {
		let self = self_ as CustomCircuit;
		debugObjects.circuits = self.circuits;
		debugObjects.wires = self.wires;
	}

	clone(): Circuit {
		let cloned = circuitCloneHelper(this) as CustomCircuit;

		cloned.circuits = [];
		cloned.wires = [];

		let circuitCloneMapping = new Map<Circuit, Circuit>();
		let wireCloneMapping = new Map<Wire, Wire>();

		cloneGraphAfterCircuit(
			this.customInputs,
			cloned.circuits,
			cloned.wires,
			circuitCloneMapping,
			wireCloneMapping
		);

		const newCustomInputs = circuitCloneMapping.get(this.customInputs);
		if (newCustomInputs == null) {
			throw Error();
		}
		cloned.customInputs = newCustomInputs as CustomCircuitInputs;

		const newCustomOutputs = circuitCloneMapping.get(this.customOutputs);
		if (newCustomOutputs == null) {
			throw Error();
		}
		cloned.customOutputs = newCustomOutputs as CustomCircuitOutputs;

		cloned.customOutputs.customCircuitProducerPins = cloned.producerPins;

		return cloned;
	}

	updateHandeler(self: Circuit) {
		let circuit = self as CustomCircuit;
		console.log('CustomCircuit: ', circuit);
		console.log('CustomCircuit.this: ', this);

		circuit.customInputs.setValues(circuit.consumerPins);
	}
}
