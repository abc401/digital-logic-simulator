import { Vec2 } from '@ts/math.js';
import { Scene } from '../../scene.js';
import { UpdationStrategy } from '@ts/engine.js';
import { ConsumerPin } from '../consumer-pin.js';
import { ProducerPin } from '../producer-pin.js';
import {
	type Circuit,
	type CircuitUpdateHandeler,
	CircuitSceneObject,
	circuitCloneHelper
} from './circuit.js';

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
