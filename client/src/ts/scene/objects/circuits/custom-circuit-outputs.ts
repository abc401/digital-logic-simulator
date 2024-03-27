import { Vec2 } from '@ts/math.js';
import { Scene } from '../../scene.js';
import { UpdationStrategy } from '@ts/engine.js';
import { ConsumerPin } from '../consumer-pin.js';
import { ProducerPin } from '../producer-pin.js';
import { sceneManager } from '@routes/+page.svelte';
import { type Circuit, CircuitSceneObject, circuitCloneHelper, type Props } from './circuit.js';

export class CustomCircuitOutputs implements Circuit {
	updationStrategy = UpdationStrategy.Immediate;
	inputWireUpdationStrategy = UpdationStrategy.Immediate;
	outputWireUpdationStrategy = UpdationStrategy.Immediate;

	props: Props = new Map();
	setProp(name: string, value: string): void {}

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
