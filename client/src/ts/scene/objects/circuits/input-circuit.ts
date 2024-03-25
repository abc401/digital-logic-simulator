import { Vec2 } from '@ts/math.js';
import { Scene } from '../../scene.js';
import { SimEvent, UpdationStrategy } from '@ts/engine.js';
import { ConsumerPin } from '../consumer-pin.js';
import { ProducerPin } from '../producer-pin.js';
import { simEngine } from '@routes/+page.svelte';
import { type Circuit, CircuitSceneObject, circuitCloneHelper } from './circuit.js';

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
}
