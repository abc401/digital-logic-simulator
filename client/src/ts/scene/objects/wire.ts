import { Vec2 } from '@ts/math.js';
import type { SceneObject } from '../scene-manager.js';
import { SimEvent, UpdationStrategy } from '@ts/engine.js';
import { ProducerPin } from '@ts/scene/objects/producer-pin.js';
import { ConsumerPin } from '@ts/scene/objects/consumer-pin.js';
import { offColor, onColor, sceneManager, simEngine, viewManager } from '@routes/+page.svelte';
import { SELECTED_COLOR } from '@ts/config.js';

export class Wire implements SceneObject {
	fromScr: Vec2 | undefined;
	toScr: Vec2 | undefined;
	value = false;
	// id: number;
	updationStrategy: UpdationStrategy = UpdationStrategy.InNextFrame;
	isSelected: boolean = false;

	constructor(
		public producerPin: ProducerPin | undefined,
		public consumerPin: ConsumerPin | undefined
	) {
		console.log('[Wire Constructor]');

		// this.id =
		sceneManager.getCurrentScene().registerWire(this);

		if (producerPin != null) {
			// producerPin.attachWire(this);
			this.setProducerPin(producerPin);
			// if (!producerPin.parentCircuit.allocateSimFrame) {
			//   this.allocateSimFrame = false;
			// }
		}

		if (consumerPin != null) {
			// consumerPin.attachWire(this);
			this.setConsumerPin(consumerPin);
			// if (!consumerPin.parentCircuit.allocateSimFrame) {
			//   this.allocateSimFrame = false;
			// }
		}

		if (producerPin == null || consumerPin == null) {
			console.log('[Wire Constructor] producerPin == null || consumerPin == null');
			return;
		}

		Wire.update(this);
	}

	static update(self: Wire) {
		// console.log("Wire.update");
		if (self.consumerPin == null) {
			console.log('Consumer == null');
		}
		if (self.producerPin == null) {
			console.log('Producer == null');
		}
		if (self.consumerPin == null || self.producerPin == null) {
			return;
		}

		self.value = self.producerPin.value;
		self.consumerPin.value = self.producerPin.value;
		console.log('self.producerPin.value', self.producerPin.value);
		console.log('this.value', self.value);
		console.log('self.consumerPin.value', self.consumerPin.value);

		if (self.consumerPin.parentCircuit.simFrameAllocated) {
			return;
		}

		const simEvent = new SimEvent(
			self.consumerPin.parentCircuit,
			self.consumerPin.parentCircuit.updateHandeler
		);

		const consumerCircuit = self.consumerPin.parentCircuit;

		if (consumerCircuit.updationStrategy === UpdationStrategy.InCurrentFrame) {
			simEngine.currentFrameEvents.enqueue(simEvent);
			self.consumerPin.parentCircuit.simFrameAllocated = true;
		} else if (consumerCircuit.updationStrategy === UpdationStrategy.InNextFrame) {
			simEngine.nextFrameEvents.enqueue(simEvent);
			self.consumerPin.parentCircuit.simFrameAllocated = true;
		} else {
			consumerCircuit.updateHandeler(consumerCircuit);
		}
	}

	detach() {
		// console.log("Wire.detach");
		if (this.consumerPin != null) {
			this.consumerPin.value = false;
			simEngine.nextFrameEvents.enqueue(
				new SimEvent(this.consumerPin.parentCircuit, this.consumerPin.parentCircuit.updateHandeler)
			);
			this.consumerPin.wire = undefined;
			this.consumerPin = undefined;
		}
		if (this.producerPin != null) {
			this.producerPin.wires = this.producerPin.wires.filter((wire) => {
				return wire !== this;
			});
			this.producerPin = undefined;
		}
		sceneManager.getCurrentScene().unregisterWire(this);
		// console.log(`wire ${this.id} has been detached`);
	}

	clone() {
		// console.log("Wire.clone");
		const cloned = Object.assign({}, this) as Wire;
		cloned.consumerPin = undefined;
		cloned.producerPin = undefined;
		Object.setPrototypeOf(cloned, Wire.prototype);
		return cloned;
	}

	getProducerPin() {
		// console.log("Wire.getProducerPin");
		return this.producerPin;
	}

	setProducerPinNoUpdate(pin: ProducerPin) {
		// console.log("Wire.setProducerPinNoUpdate");
		this.producerPin = pin;
		pin.wires.push(this);
		// pin.attachWire(this);

		console.log('[Wire.setProducerPin] wire: ', this);

		if (pin.parentCircuit.outputWireUpdationStrategy !== UpdationStrategy.InNextFrame) {
			this.updationStrategy = pin.parentCircuit.outputWireUpdationStrategy;
		}
	}

	updateIsSelected() {
		// console.log("Wire.updateIsSelected");
		if (this.consumerPin == null || this.producerPin == null) {
			return;
		}
		if (
			this.consumerPin.parentCircuit.sceneObject == null ||
			this.producerPin.parentCircuit.sceneObject == null
		) {
			this.isSelected = false;
			return;
		}
		if (
			this.consumerPin.parentCircuit.sceneObject.isSelected &&
			this.producerPin.parentCircuit.sceneObject.isSelected
		) {
			sceneManager.selectWire(this);
			this.isSelected = true;
		}
	}

	configSceneObject() {
		// console.log("Wire.configSceneObject");
		// this.id =
		sceneManager.getCurrentScene().registerWire(this);
		this.isSelected = false;
	}

	setProducerPin(pin: ProducerPin) {
		// console.log("Wire.setProducerPin");
		this.producerPin = pin;
		pin.attachWire(this);
		this.updateIsSelected();

		console.log('[Wire.setProducerPin] wire: ', this);

		if (pin.parentCircuit.outputWireUpdationStrategy !== UpdationStrategy.InNextFrame) {
			this.updationStrategy = pin.parentCircuit.outputWireUpdationStrategy;
		}

		console.log('Producer', pin.parentCircuit);
		if (this.consumerPin == null) {
			this.value = this.producerPin.value;
			return;
		}

		console.log('propogated Value');
		Wire.update(this);
	}

	getConsumerPin() {
		// console.log("Wire.getConsumerPin");
		return this.consumerPin;
	}

	setConsumerPin(pin: ConsumerPin) {
		// console.log("Wire.setConsumerPin");
		pin.attachWire(this);
		this.consumerPin = pin;
		if (pin.parentCircuit.updationStrategy !== UpdationStrategy.InNextFrame) {
			this.updationStrategy = pin.parentCircuit.inputWireUpdationStrategy;
		}

		this.updateIsSelected();

		console.log('Consumer: ', pin.parentCircuit);
		if (this.producerPin == null) {
			this.value = this.consumerPin.value;
			return;
		}

		console.log('Propogated Value');
		Wire.update(this);
	}

	setConsumerPinNoUpdate(pin: ConsumerPin) {
		// console.log("Wire.setConsumerPinNoUpdate");
		pin.wire = this;
		this.consumerPin = pin;

		if (pin.parentCircuit.updationStrategy !== UpdationStrategy.InNextFrame) {
			this.updationStrategy = pin.parentCircuit.inputWireUpdationStrategy;
		}
		if (this.producerPin == null) {
			this.value = this.consumerPin.value;
		}

		console.log('Consumer: ', pin.parentCircuit);
	}

	// propogateValue(value: boolean) {
	//   if (this.consumerPin == null) {
	//     console.log("Consumer was null");
	//     return;
	//   }

	//   if (value === this.consumerPin.value) {
	//     console.log("produced === consumed");
	//     return;
	//   }
	//   this.consumerPin.value = value;

	//   console.log("Enqueued");
	//   simEngine.nextFrameEvents.enqueue(
	//     new SimEvent(
	//       this.consumerPin.parentCircuit,
	//       this.consumerPin.parentCircuit.updateHandeler
	//     )
	//   );
	// }

	draw(ctx: CanvasRenderingContext2D) {
		// console.log("Wire.draw");
		const from = this.producerPin == null ? this.fromScr : this.producerPin.getLocScr();
		const to = this.consumerPin == null ? this.toScr : this.consumerPin.getLocScr();

		if (from == null || to == null) {
			return;
		}

		ctx.beginPath();
		ctx.moveTo(from.x, from.y);
		ctx.lineTo(to.x, to.y);
		ctx.closePath();

		if (this.isSelected) {
			ctx.lineWidth = 12 * viewManager.zoomLevel;
			ctx.strokeStyle = SELECTED_COLOR;
			ctx.stroke();
		}

		// (this.consumerPin && this.consumerPin.value) ||
		// (this.producerPin && this.producerPin.value)
		if (this.value) {
			ctx.strokeStyle = onColor;
		} else {
			ctx.strokeStyle = offColor;
		}

		ctx.lineWidth = 10 * viewManager.zoomLevel;
		ctx.stroke();
	}
}
