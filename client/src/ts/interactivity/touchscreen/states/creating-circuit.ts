import {
	TouchAction,
	TouchActionKind,
	type TouchScreenState,
	TouchScreenStateMachine,
	discriminateTouches
} from '../state-machine.js';
import type { Circuit } from '@ts/scene/objects/circuits/circuit.js';
import { Illegal } from './Illegal.js';
import { Vec2 } from '@ts/math.js';
import { Home as TouchScreenHome } from './home.js';
import { Home as MouseHome } from '@ts/interactivity/mouse/states/home.js';
import { canvas, mouseStateMachine, viewManager } from '@routes/+page.svelte';
import { logState } from '@lib/stores/debugging.js';

export class CreatingCircuit implements TouchScreenState {
	constructor(
		private name: string,
		private creator: () => Circuit
	) {
		logState(`CreatingCircuit(${this.name})`);
	}
	update(stateMachine: TouchScreenStateMachine, action: TouchAction): void {
		const payload = action.payload;
		const boundingRect = canvas.getBoundingClientRect();
		const [insideOfCanvas, outsideOfCanvas] = discriminateTouches(payload.changedTouches);

		if (outsideOfCanvas.length > 0) {
			stateMachine.state = new Illegal();
			return;
		}
		if (action.kind === TouchActionKind.TouchEnd) {
			const touch = payload.changedTouches[0];
			const locScr = new Vec2(touch.clientX - boundingRect.x, touch.clientY - boundingRect.y);

			const circuit = this.creator();
			if (circuit.sceneObject == null) {
				throw Error();
			}
			circuit.sceneObject.tightRectWrl.xy = viewManager.screenToWorld(locScr);
			// domLog(`Created ${this.name}`);
			// domLog(
			//   `circuit.value: ${circuit.value}, circuit.pin.value: ${circuit.producerPins[0].value}`
			// );
			mouseStateMachine.state = new MouseHome();
			stateMachine.state = new TouchScreenHome();
		}
	}
}
