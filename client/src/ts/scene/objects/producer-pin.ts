import { Circle, Vec2 } from '../../math.js';
// import { sceneManager, simEngine, viewManager } from '../../main.js';
import { SimEvent, UpdationStrategy } from '../../engine.js';
import { Wire } from './wire.js';
import type { Circuit } from './circuits/circuit.js';
import type { CustomCircuitInputs } from './circuits/custom-circuit-inputs.js';
import { PIN_TO_PIN_DISTANCE_WRL } from '@ts/config.js';
import { offColor, onColor, simEngine, viewManager } from '@routes/+page.svelte';
import { CircuitSceneObject } from '../scene.js';
// import { CircuitSceneObject } from '../scene.js';

export class ProducerPin {
	wires: Wire[];
	value: boolean;
	// selected = false;

	onWireAttached: (self: CustomCircuitInputs) => void = () => { };

	constructor(
		readonly parentCircuit: Circuit,
		readonly pinIndex: number,
		value: boolean = false
	) {
		this.wires = [];
		this.value = value;
	}

	attachWire(wire: Wire) {
		this.wires.push(wire);
		this.onWireAttached(this.parentCircuit as CustomCircuitInputs);
	}

	setValue(value: boolean) {
		if (this.value === value) {
			console.log('[producer.setValue] producer.value === new value');
			return;
		}

		this.value = value;
		for (let i = 0; i < this.wires.length; i++) {
			console.log('Updation Strategy', this.wires[i].updationStrategy);
			if (this.wires[i].updationStrategy === UpdationStrategy.Immediate) {
				Wire.update(this.wires[i]);
			} else if (this.wires[i].updationStrategy === UpdationStrategy.InNextFrame) {
				simEngine.nextFrameEvents.enqueue(new SimEvent(this.wires[i], Wire.update));
			} else {
				throw Error();
			}
		}
	}

	getLocWrl() {
		if (this.parentCircuit.sceneObject == null) {
			throw Error();
		}

		const bodyRectWrl = this.parentCircuit.sceneObject.bodyRectWrl;

		return new Vec2(
			bodyRectWrl.x + bodyRectWrl.w,
			bodyRectWrl.y +
			CircuitSceneObject.bodyPaddingYWrl +
			this.pinIndex * (CircuitSceneObject.pinRadiusWrl * 2 + PIN_TO_PIN_DISTANCE_WRL) +
			CircuitSceneObject.pinRadiusWrl
		);
	}

	getLocScr() {
		return viewManager.worldToScreen(this.getLocWrl());
	}

	pointCollision(pointWrl: Vec2) {
		const locWrl = this.getLocWrl();
		return locWrl.sub(pointWrl).mag() < CircuitSceneObject.pinRadiusWrl;
	}

	draw(ctx: CanvasRenderingContext2D) {
		const posScr = this.getLocScr();

		// const style = getComputedStyle(document.body);

		// const onColor = style.getPropertyValue('--clr-on');
		// const offColor = style.getPropertyValue('--clr-off');

		ctx.lineWidth = 5 * viewManager.zoomLevel;
		// ctx.strokeStyle = '#32424B';
		// ctx.beginPath();
		// ctx.arc(
		// 	posScr.x,
		// 	posScr.y,
		// 	CircuitSceneObject.pinRadiusWrl * viewManager.zoomLevel,
		// 	(1 / 2) * Math.PI,
		// 	(3 / 2) * Math.PI
		// );
		// ctx.stroke();

		ctx.beginPath();
		ctx.arc(
			posScr.x,
			posScr.y,
			CircuitSceneObject.pinRadiusWrl * viewManager.zoomLevel,
			0,
			2 * Math.PI
		);

		if (this.value) {
			ctx.fillStyle = onColor;
		} else {
			ctx.fillStyle = offColor;
		}
		ctx.fill();
	}
}
