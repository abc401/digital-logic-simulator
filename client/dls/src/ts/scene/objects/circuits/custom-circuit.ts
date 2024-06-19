import { debugObjects } from '../../scene-manager.js';
import { Scene } from '../../scene.js';
import { UpdationStrategy } from '@ts/engine.js';
import { ConsumerPin } from '../consumer-pin.js';
import { ProducerPin } from '../producer-pin.js';
import { Wire } from '../wire.js';
import { CustomCircuitInputs } from './custom-circuit-inputs.js';
import { CustomCircuitOutputs } from './custom-circuit-outputs.js';
import { type Circuit, cloneGraphAfterCircuit, circuitCloneHelper } from './circuit.js';
import { CircuitSceneObject } from './circuit.js';
import { sceneManager } from '@src/routes/dls/+page.svelte';

export class CustomCircuit implements Circuit {
	updationStrategy = UpdationStrategy.Immediate;
	inputWireUpdationStrategy = UpdationStrategy.InNextFrame;
	outputWireUpdationStrategy = UpdationStrategy.InNextFrame;

	circuitType: string;
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

		const circuitCloneMapping = new Map<Circuit, Circuit>();
		const wireCloneMapping = new Map<Wire, Wire>();

		for (const circuit of this.scene.circuits.topToBottom()) {
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

		if (scene.id == null) {
			throw Error();
		}
		// const name =

		this.circuitType = scene.name;
		this.props.label = scene.name;

		console.log('CustomCircuit.constructor: ', this);
	}

	updateCircuitGraph() {
		console.log(`[updateCircuitGraph]: `, this);

		const scene = sceneManager.scenes.get(this.scene.id as number);
		if (scene == null) {
			throw Error();
		}
		this.circuits = [];
		this.wires = [];

		const circuitCloneMapping = new Map<Circuit, Circuit>();
		const wireCloneMapping = new Map<Wire, Wire>();

		for (const circuit of scene.circuits.topToBottom()) {
			cloneGraphAfterCircuit(
				circuit.data.parentCircuit,
				this.circuits,
				this.wires,
				circuitCloneMapping,
				wireCloneMapping
			);
		}

		if (scene.customCircuitInputs == null) {
			throw Error();
		}

		const newCustomInputs = circuitCloneMapping.get(scene.customCircuitInputs);
		if (newCustomInputs == null) {
			throw Error();
		}
		this.customInputs = newCustomInputs as CustomCircuitInputs;

		if (scene.customCircuitOutputs == null) {
			throw Error();
		}
		const newCustomOutputs = circuitCloneMapping.get(scene.customCircuitOutputs);
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

	refreshLabel() {
		if (this.props.label === this.circuitType) {
			this.props.label = this.scene.name;
		}
		this.circuitType = this.scene.name;
		if (this.sceneObject != null) {
			this.sceneObject.refreshLabel();
		}
	}

	onSceneObjectConfigured(): void {
		if (this.sceneObject == null) {
			throw Error();
		}
		if (this.scene.id == null) {
			throw Error();
		}

		let entry = this.sceneObject.parentScene.customCircuitInstances.get(this.scene.id);
		if (entry == null) {
			entry = {
				instances: new Set(),
				lastUpdateIdx: this.scene.lastUpdateIdx
			};
		}
		entry.instances.add(this);

		this.sceneObject.parentScene.customCircuitInstances.set(this.scene.id, entry);

		console.log(
			`CustomCircuitInstances for ${this.sceneObject.parentScene.name}: `,
			this.sceneObject.parentScene.customCircuitInstances
		);

		// this.sceneObject.onClicked = this.onClicked;
	}

	onClicked(self_: Circuit) {
		const self = self_ as CustomCircuit;
		debugObjects.circuits = self.circuits;
		debugObjects.wires = self.wires;
	}

	clone(): Circuit {
		const cloned = circuitCloneHelper(this) as CustomCircuit;

		cloned.circuits = [];
		cloned.wires = [];

		const circuitCloneMapping = new Map<Circuit, Circuit>();
		const wireCloneMapping = new Map<Wire, Wire>();

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
		const circuit = self as CustomCircuit;
		console.log('CustomCircuit: ', circuit);
		console.log('CustomCircuit.this: ', this);

		circuit.customInputs.setValues(circuit.consumerPins);
	}
}
