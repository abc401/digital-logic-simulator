import { CircuitSceneObject } from '@ts/scene/objects/circuit.js';
import {
	MouseAction,
	MouseActionKind,
	type MouseState,
	MouseStateMachine
} from '../state-machine.js';
import { Dragging } from './dragging.js';
import { Panning } from './panning.js';
import { Vec2 } from '@ts/math.js';
import { Home } from './home.js';
import { DraggingSelection } from './dragging-selection.js';
import { sceneManager } from '@routes/+page.svelte';
import { logState } from '@lib/stores/debugging.js';

export class MouseDownPrimaryButton implements MouseState {
	constructor(
		private circuit: CircuitSceneObject | undefined = undefined,
		private offsetWrl: Vec2 | undefined = undefined
	) {
		logState('MouseDownPrimaryButton');
	}

	update(stateMachine: MouseStateMachine, action: MouseAction): void {
		const payload = action.payload;
		if (action.kind === MouseActionKind.MouseMove) {
			if (this.circuit == null) {
				stateMachine.state = new Panning();
				return;
			} else {
				if (this.offsetWrl == null) {
					throw Error();
				}

				const locScr = new Vec2(payload.offsetX, payload.offsetY);

				if (this.circuit.isSelected) {
					stateMachine.state = new DraggingSelection(this.circuit, this.offsetWrl, locScr);
					return;
				}

				if (!payload.ctrlKey) {
					sceneManager.clearSelectedCircuits();
				}
				sceneManager.selectCircuit(this.circuit);
				stateMachine.state = new Dragging(this.circuit, this.offsetWrl, locScr);
			}
		}
		if (action.kind === MouseActionKind.MouseUp) {
			if (!payload.ctrlKey) {
				sceneManager.clearSelectedCircuits();
			}
			if (this.circuit != null) {
				if (this.circuit.isSelected) {
					sceneManager.deselectCircuit(this.circuit);
				} else {
					sceneManager.selectCircuit(this.circuit);
				}
			}
			stateMachine.state = new Home();
			return;
		}
	}
}
