import {
	MouseAction,
	MouseActionKind,
	MouseStateMachine,
	type MouseState,
	MouseButton
} from '@ts/interactivity/mouse/state-machine.js';
import { Home } from './home.js';
import { Vec2 } from '@ts/math.js';
import { actionsManager, canvas, view } from '@src/routes/dls/+page.svelte';
import { logState } from '@lib/stores/debugging.js';
import { PanUserAction } from '../../actions.js';

export class Panning implements MouseState {
	totalDelta: Vec2 = new Vec2(0, 0);

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
			if (this.totalDelta.x != 0 || this.totalDelta.y != 0) {
				actionsManager.push(new PanUserAction(this.totalDelta));
			}
			stateMachine.state = new Home();
		}
		if (action.kind === MouseActionKind.MouseMove) {
			const delta = new Vec2(payload.movementX, payload.movementY);
			this.totalDelta = this.totalDelta.add(delta);
			view.pan(delta);
		}
	}
}
