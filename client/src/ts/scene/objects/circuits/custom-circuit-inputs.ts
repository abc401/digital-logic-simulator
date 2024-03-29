import { Vec2 } from '@ts/math.js';
import { Scene } from '../../scene.js';
import { UpdationStrategy } from '@ts/engine.js';
import { ConsumerPin } from '../consumer-pin.js';
import { ProducerPin } from '../producer-pin.js';
import { Wire } from '../wire.js';
import { sceneManager } from '@routes/+page.svelte';
import { type Circuit, CircuitSceneObject, circuitCloneHelper } from './circuit.js';

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
