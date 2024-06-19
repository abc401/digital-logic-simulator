import { UpdationStrategy } from '@ts/engine.js';
import { ConsumerPin } from '../consumer-pin.js';
import { ProducerPin } from '../producer-pin.js';
import { type Circuit, circuitCloneHelper } from './circuit.js';
import { CircuitSceneObject } from './circuit.js';

export class CustomCircuitOutputs implements Circuit {
	updationStrategy = UpdationStrategy.Immediate;
	inputWireUpdationStrategy = UpdationStrategy.Immediate;
	outputWireUpdationStrategy = UpdationStrategy.Immediate;

	circuitType = 'CustomCircuitOutputs';
	props = { label: 'CustomCircuitOutputs' };
	propTypes = {};
	propSetters = {};

	simFrameAllocated = false;

	consumerPins: ConsumerPin[];
	producerPins: ProducerPin[];

	customCircuitProducerPins: ProducerPin[] | undefined;

	sceneObject: CircuitSceneObject | undefined;

	constructor() {
		this.sceneObject = undefined;
		const nConsumerPins = 1;

		this.producerPins = Array(0);

		this.consumerPins = new Array(nConsumerPins);

		for (let i = 0; i < this.consumerPins.length; i++) {
			this.consumerPins[i] = new ConsumerPin(this, i);
		}

		const consumerPin = this.consumerPins[0];
		consumerPin.onWireAttached = CustomCircuitOutputs.addPin;
	}

	clone(): Circuit {
		const cloned = circuitCloneHelper(this) as CustomCircuitOutputs;
		cloned.customCircuitProducerPins = undefined;
		return cloned;
	}

	updateHandeler(self: Circuit) {
		const circuit = self as CustomCircuitOutputs;
		if (circuit.customCircuitProducerPins == null) {
			console.log('circuit.customCircuitProducerPins == null');
			return;
		}
		for (let i = 0; i < circuit.consumerPins.length - 1; i++) {
			circuit.customCircuitProducerPins[i].setValue(circuit.consumerPins[i].value);
		}
	}

	onSceneObjectConfigured(): void {}

	static addPin(self: CustomCircuitOutputs) {
		const newPinIndex = self.consumerPins.length;
		const currentLastPin = self.consumerPins[newPinIndex - 1];
		currentLastPin.onWireAttached = () => {};

		const newPin = new ConsumerPin(self, newPinIndex);
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
