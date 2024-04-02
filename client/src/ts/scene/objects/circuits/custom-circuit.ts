import { Vec2 } from '@ts/math.js';
import { debugObjects } from '../../scene-manager.js';
import { Scene } from '../../scene.js';
import { UpdationStrategy } from '@ts/engine.js';
import { ConsumerPin } from '../consumer-pin.js';
import { ProducerPin } from '../producer-pin.js';
import { Wire } from '../wire.js';
import { sceneManager } from '@routes/+page.svelte';
import { CustomCircuitInputs } from './custom-circuit-inputs.js';
import { CustomCircuitOutputs } from './custom-circuit-outputs.js';
import { type Circuit, cloneGraphAfterCircuit, circuitCloneHelper, type Props } from './circuit.js';
import { CircuitSceneObject } from '@ts/scene/scene.js';

export class CustomCircuit implements Circuit {
	updationStrategy = UpdationStrategy.Immediate;
	inputWireUpdationStrategy = UpdationStrategy.InNextFrame;
	outputWireUpdationStrategy = UpdationStrategy.InNextFrame;

	props = { label: '' };
	propTypes = {};
	propSetters = {};

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
		this.props.label = scene.name;

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

	configSceneObject(
		pos: Vec2,
		targetScene: Scene | undefined = undefined,
		ctx: CanvasRenderingContext2D
	): void {
		if (targetScene == null) {
			targetScene = sceneManager.getCurrentScene();
		}

		this.sceneObject = CircuitSceneObject.new(this, pos, targetScene, ctx);
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
