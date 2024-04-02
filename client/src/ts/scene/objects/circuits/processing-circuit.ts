import { Vec2 } from '@ts/math.js';
import { Scene } from '../../scene.js';
import { UpdationStrategy } from '@ts/engine.js';
import { ConsumerPin } from '../consumer-pin.js';
import { ProducerPin } from '../producer-pin.js';
import {
	circuitCloneHelper,
	type Circuit,
	type CircuitUpdateHandeler,
	type Props,
	type PropTypes,
	type PropSetters,
	CircuitPropType,
	defaultPropTypes
} from './circuit.js';
import { CircuitSceneObject } from '@ts/scene/scene.js';

export class ProcessingCircuit implements Circuit {
	simFrameAllocated = false;

	updationStrategy = UpdationStrategy.InNextFrame;

	inputWireUpdationStrategy = UpdationStrategy.InNextFrame;
	outputWireUpdationStrategy = UpdationStrategy.InNextFrame;

	updateHandeler: CircuitUpdateHandeler;

	consumerPins: ConsumerPin[];
	producerPins: ProducerPin[];

	props: Props = { label: '' };
	propTypes: PropTypes = {};
	propSetters: PropSetters = {};

	sceneObject: CircuitSceneObject | undefined;

	constructor(
		nConsumerPins: number,
		nProducerPins: number,
		updateHandeler: CircuitUpdateHandeler,
		label: string
	) {
		this.sceneObject = undefined;

		this.producerPins = new Array(nProducerPins);
		for (let i = 0; i < nProducerPins; i++) {
			this.producerPins[i] = new ProducerPin(this, i);
		}

		this.consumerPins = new Array(nConsumerPins);
		for (let i = 0; i < nConsumerPins; i++) {
			this.consumerPins[i] = new ConsumerPin(this, i);
		}

		this.props.label = label;

		this.updateHandeler = updateHandeler;

		this.updateHandeler(this);
	}

	newProp(
		name: string,
		propType: CircuitPropType,
		initialValue: any,
		setter: (circuit: Circuit, value: any) => boolean
	) {
		if (name in defaultPropTypes || name in this.props) {
			throw Error();
		}
		this.props[name] = initialValue;
		this.propTypes[name] = propType;
		this.propSetters[name] = setter;
	}

	configSceneObject(
		pos: Vec2,
		scene: Scene | undefined = undefined,
		ctx: CanvasRenderingContext2D
	): void {
		this.sceneObject = CircuitSceneObject.new(this, pos, scene, ctx);
	}

	clone(): Circuit {
		return circuitCloneHelper(this);
	}
}
