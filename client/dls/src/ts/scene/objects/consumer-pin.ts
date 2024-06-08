// import { sceneManager, viewManager } from '../../main.js';
import { Wire } from './wire.js';
import type { Circuit } from './circuits/circuit.js';
import type { CustomCircuitOutputs } from './circuits/custom-circuit-outputs.js';
import { PIN_TO_PIN_DISTANCE_WRL } from '@ts/config.js';
import { Vec2 } from '@ts/math.js';
import { offColor, onColor, view } from '@src/routes/dls/+page.svelte';
import { CircuitSceneObject } from './circuits/circuit.js';

export class ConsumerPin {
	wire: Wire | undefined;
	// value: boolean = false;

	onWireAttached: (self: CustomCircuitOutputs) => void = () => {};

	constructor(
		readonly parentCircuit: Circuit,
		public pinIndex: number,
		public value = false
	) {}

	getLocWrl() {
		if (this.parentCircuit.sceneObject == null) {
			throw Error();
		}

		const circuitBodyRect = this.parentCircuit.sceneObject.bodyRectWrl;
		// bodyPos.x,
		return new Vec2(
			circuitBodyRect.x,
			circuitBodyRect.y +
				CircuitSceneObject.paddingYWrl +
				this.pinIndex * (CircuitSceneObject.pinRadiusWrl * 2 + PIN_TO_PIN_DISTANCE_WRL) +
				CircuitSceneObject.pinRadiusWrl
		);
	}

	getLocScr() {
		return view.worldToScreen(this.getLocWrl());
	}

	attachWire(wire: Wire) {
		if (this.wire != null) {
			this.wire.detach();
		}

		this.wire = wire;
		this.onWireAttached(this.parentCircuit as CustomCircuitOutputs);
	}

	pointCollision(pointWrl: Vec2) {
		const locWrl = this.getLocWrl();
		return locWrl.sub(pointWrl).mag() < CircuitSceneObject.pinRadiusWrl;
	}

	draw(ctx: CanvasRenderingContext2D) {
		const pos = this.getLocScr();

		ctx.beginPath();
		ctx.arc(pos.x, pos.y, CircuitSceneObject.pinRadiusWrl * view.zoomLevel, 0, 2 * Math.PI);
		if (this.value) {
			ctx.fillStyle = onColor;
		} else {
			ctx.fillStyle = offColor;
		}
		ctx.fill();
	}
}
