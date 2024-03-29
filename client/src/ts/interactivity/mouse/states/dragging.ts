import { CircuitSceneObject } from '@ts/scene/objects/circuits/circuit.js';
import {
	MouseAction,
	MouseActionKind,
	MouseStateMachine,
	type MouseState,
	MouseButton
} from '../state-machine.js';
import { Home } from './home.js';
import { Vec2 } from '@ts/math.js';
import { viewManager } from '@routes/+page.svelte';
import { logState } from '@lib/stores/debugging.js';

export class Dragging implements MouseState {
	constructor(
		private circuit: CircuitSceneObject,
		private draggingOffsetWrl: Vec2,
		mouseLocScr: Vec2 | undefined = undefined
	) {
		if (mouseLocScr == null) {
			return;
		}

		this.circuit.setPos(viewManager.screenToWorld(mouseLocScr).add(this.draggingOffsetWrl));

		logState('Dragging');
	}

	update(stateMachine: MouseStateMachine, action: MouseAction) {
		const payload = action.payload;
		const locScr = new Vec2(payload.offsetX, payload.offsetY);

		if (action.kind === MouseActionKind.MouseMove) {
			this.circuit.setPos(viewManager.screenToWorld(locScr).add(this.draggingOffsetWrl));
		}
		if (action.kind === MouseActionKind.MouseUp) {
			if (payload.buttonEncoded !== MouseButton.Primary) {
				return;
			}
			stateMachine.state = new Home();
		}
	}
}
