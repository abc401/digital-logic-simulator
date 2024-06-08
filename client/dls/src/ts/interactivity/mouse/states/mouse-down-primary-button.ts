import { CircuitSceneObject } from '@src/ts/scene/objects/circuits/circuit.js';
import {
	MouseAction,
	MouseActionKind,
	type MouseState,
	MouseStateMachine
} from '../state-machine.js';
import { Panning } from './panning.js';
import { Vec2 } from '@ts/math.js';
import { Home } from './home.js';
import { DraggingSelection } from './dragging-selection.js';
import { actionsManager, canvas, sceneManager } from '@src/routes/dls/+page.svelte';
import { logState } from '@lib/stores/debugging.js';
import type { ID } from '@src/ts/scene/scene.js';
import {
	DeselectAllUserAction,
	DeselectCircuitUserAction,
	SelectCircuitUserAction
} from '../../actions.js';

export class MouseDownPrimaryButton implements MouseState {
	constructor(
		private circuit: CircuitSceneObject | undefined = undefined,
		private offsetWrl: Vec2 | undefined = undefined
	) {
		if (this.circuit != null) {
			if (this.circuit.id == null) {
				throw Error();
			}
		}

		logState('MouseDownPrimaryButton');
	}

	update(stateMachine: MouseStateMachine, action: MouseAction): void {
		const payload = action.payload;
		if (payload.target != canvas) {
			return;
		}
		if (action.kind === MouseActionKind.MouseMove) {
			if (this.circuit == null) {
				stateMachine.state = new Panning();
				return;
			} else {
				if (this.offsetWrl == null) {
					throw Error();
				}

				if (!this.circuit.isSelected) {
					if (sceneManager.selectedCircuits.size > 0) {
						actionsManager.do(new DeselectAllUserAction());
					}
					actionsManager.do(new SelectCircuitUserAction(this.circuit.id as ID));
					// sceneManager.deselectAll();
				}
				// sceneManager.selectCircuit(this.circuit.id as ID);
				const locScr = new Vec2(payload.offsetX, payload.offsetY);

				stateMachine.state = new DraggingSelection(this.circuit, this.offsetWrl, locScr);
				return;
			}
		} else if (action.kind === MouseActionKind.MouseUp) {
			if (!payload.ctrlKey && sceneManager.selectedCircuits.size > 0) {
				actionsManager.do(new DeselectAllUserAction());
				// sceneManager.deselectAll();
			}
			if (this.circuit != null) {
				if (this.circuit.isSelected) {
					actionsManager.do(new DeselectCircuitUserAction(this.circuit.id as ID));
				} else {
					actionsManager.do(new SelectCircuitUserAction(this.circuit.id as ID));
				}
			}
			stateMachine.state = new Home();
			return;
		}
	}
}
