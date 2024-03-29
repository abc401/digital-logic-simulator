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
import { canvas, sceneManager, viewManager } from '@routes/+page.svelte';
import { logState } from '@lib/stores/debugging.js';

export class DraggingSelection implements MouseState {
	constructor(
		private focusCircuit: CircuitSceneObject,
		private draggingOffsetWrl: Vec2,
		mouseLocScr: Vec2 | undefined = undefined
	) {
		if (mouseLocScr == null) {
			return;
		}

		this.dragCircuits(mouseLocScr);

		logState('Dragging');
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
			stateMachine.state = new Home();
		}
	}

	dragCircuits(mouseLocScr: Vec2) {
		const focusCircuitNewPositionWrl = viewManager
			.screenToWorld(mouseLocScr)
			.add(this.draggingOffsetWrl);

		const dragMovement = focusCircuitNewPositionWrl.sub(this.focusCircuit.tightRectWrl.xy);

		for (let circuit of sceneManager.selectedCircuits) {
			circuit.setPos(circuit.tightRectWrl.xy.add(dragMovement));
		}
	}
}
