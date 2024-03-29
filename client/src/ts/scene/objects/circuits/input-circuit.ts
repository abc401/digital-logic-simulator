import { Vec2 } from '@ts/math.js';
import { Scene } from '../../scene.js';
import { SimEvent, UpdationStrategy } from '@ts/engine.js';
import { ConsumerPin } from '../consumer-pin.js';
import { ProducerPin } from '../producer-pin.js';
import { simEngine } from '@routes/+page.svelte';
import {
	type Circuit,
	CircuitSceneObject,
	circuitCloneHelper,
	type Props,
	CircuitPropType,
	type PropTypes
} from './circuit.js';

interface InputCircuitProps {
	value: boolean;
	abc: number;
	def: string;
}

export class InputCircuit implements Circuit {
	updationStrategy = UpdationStrategy.InNextFrame;
	inputWireUpdationStrategy = UpdationStrategy.InNextFrame;
	outputWireUpdationStrategy = UpdationStrategy.InNextFrame;

	props: InputCircuitProps = {
		value: false,
		abc: 1,
		def: 'abc'
	};

	propTypes = {
		value: CircuitPropType.Bool,
		abc: CircuitPropType.NaturalNumber,
		def: CircuitPropType.String
	};

	simFrameAllocated = false;

	consumerPins: ConsumerPin[];
	producerPins: ProducerPin[];

	sceneObject: CircuitSceneObject | undefined;

	constructor(value: boolean) {
		this.sceneObject = undefined;

		this.consumerPins = new Array();

		this.producerPins = Array(1);
		for (let i = 0; i < this.producerPins.length; i++) {
			this.producerPins[i] = new ProducerPin(this, i);
		}

		this.updateHandeler(this);

		simEngine.recurringEvents.push(new SimEvent(this, this.updateHandeler));
	}

	setProp(name: string, value: any) {
		if (name === 'value') {
			if (typeof value != 'boolean') {
				throw Error();
			}
			this.props.value = value;
			this.producerPins[0].setValue(this.props.value);
			return true;
		}
		return false;
	}

	updateHandeler(self_: Circuit) {
		let self = self_ as InputCircuit;
		self.producerPins[0].setValue(self.props.value);
	}

	clone(): Circuit {
		return circuitCloneHelper(this);
	}

	configSceneObject(pos: Vec2, scene: Scene | undefined = undefined): void {
		this.sceneObject = CircuitSceneObject.new(this, pos, scene);
	}
}
