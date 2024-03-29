import {
	MouseAction,
	MouseActionKind,
	MouseStateMachine,
	type MouseState,
	MouseButton
} from '@ts/interactivity/mouse/state-machine.js';
import { Home } from './home.js';
import { Vec2 } from '@ts/math.js';
import { canvas, viewManager } from '@routes/+page.svelte';
import { logState } from '@lib/stores/debugging.js';

export class Panning implements MouseState {
	constructor() {
		logState('Panning');
	}

	update(stateMachine: MouseStateMachine, action: MouseAction) {
		const payload = action.payload;

		if (payload.target != canvas) {
			return;
		}

		if (action.kind === MouseActionKind.MouseUp) {
			if (payload.buttonEncoded !== MouseButton.Primary) {
				return;
			}
			stateMachine.state = new Home();
		}
		if (action.kind === MouseActionKind.MouseMove) {
			const delta = new Vec2(payload.movementX, payload.movementY);
			viewManager.pan(delta);
		}
	}
}
