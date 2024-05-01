import { CircuitSceneObject } from '@src/ts/scene/objects/circuits/circuit.js';
import {
	MouseAction,
	MouseActionKind,
	MouseStateMachine,
	type MouseState,
	MouseButton
} from '../state-machine.js';
import { Home } from './home.js';
import { Vec2 } from '@ts/math.js';
import { actionsManager, canvas, sceneManager, viewManager } from '@routes/+page.svelte';
import { logState } from '@lib/stores/debugging.js';
import { DragUserAction, dragSelection } from '../../actions.js';

export class DraggingSelection implements MouseState {
	totalDelta: Vec2 = new Vec2(0, 0);

	constructor(
		private focusCircuit: CircuitSceneObject,
		private draggingOffsetWrl: Vec2,
		mouseLocScr: Vec2 | undefined = undefined
	) {
		if (mouseLocScr == null) {
			return;
		}

		this.dragCircuits(mouseLocScr);

		logState('Dragging Selection');
	}

	update(stateMachine: MouseStateMachine, action: MouseAction) {
		const payload = action.payload;

		if (payload.target != canvas) {
			return;
		}
		const locScr = new Vec2(payload.offsetX, payload.offsetY);

		if (action.kind === MouseActionKind.MouseMove) {
			this.dragCircuits(locScr);
		}

		if (action.kind === MouseActionKind.MouseUp) {
			if (payload.buttonEncoded !== MouseButton.Primary) {
				return;
			}

			if (this.totalDelta.x != 0 || this.totalDelta.y != 0) {
				actionsManager.push(new DragUserAction(this.totalDelta));
			}

			stateMachine.state = new Home();
		}
	}

	dragCircuits(mouseLocScr: Vec2) {
		const focusCircuitNewPositionWrl = viewManager
			.screenToWorld(mouseLocScr)
			.add(this.draggingOffsetWrl);

		const delta = focusCircuitNewPositionWrl.sub(this.focusCircuit.tightRectWrl.xy);
		this.totalDelta = this.totalDelta.add(delta);

		dragSelection(delta);
	}
}
