import type { Circuit, CircuitSceneObject } from '@ts/scene/objects/circuits/circuit.js';
import {
	TouchAction,
	TouchActionKind,
	type TouchScreenState,
	TouchScreenStateMachine,
	discriminateTouches,
	findTouch
} from '../state-machine.js';
// import { Dragging } from './dragging.js';
import { Vec2 } from '@ts/math.js';
import { Home } from './home.js';
import { Illegal } from './Illegal.js';
import { Zooming } from './zooming.js';
import { canvas } from '@src/routes/dls/+page.svelte';
import { domLog, logState } from '@lib/stores/debugging.js';
import { DraggingSelection } from './dragging-selection.js';

export class CircuitSelected implements TouchScreenState {
	constructor(
		private circuit: Circuit,
		private touchId: number,
		private offsetWrl: Vec2
	) {
		logState('TSCircuitSelected');
	}
	update(stateMachine: TouchScreenStateMachine, action: TouchAction): void {
		const payload = action.payload;
		const boundingRect = canvas.getBoundingClientRect();
		const [insideOfCanvas, outsideOfCanvas] = discriminateTouches(payload.changedTouches);

		if (outsideOfCanvas.length > 0) {
			stateMachine.state = new Illegal();
			return;
		}
		if (action.kind === TouchActionKind.TouchStart) {
			if (insideOfCanvas.length === 1) {
				stateMachine.state = new Zooming(this.touchId, insideOfCanvas[0].identifier);
			} else {
				stateMachine.state = new Illegal();
			}
		}

		if (action.kind === TouchActionKind.TouchMove) {
			const touch = findTouch(this.touchId, payload.changedTouches);
			if (touch == null) {
				domLog("[CircuitSelectedErr] Some touch moved and it wasn't my touch");
				throw Error();
			}

			const locScr = new Vec2(touch.clientX - boundingRect.x, touch.clientY - boundingRect.y);
			stateMachine.state = new DraggingSelection(
				this.touchId,
				this.circuit.sceneObject as CircuitSceneObject,
				this.offsetWrl,
				locScr
			);
		}
		if (action.kind === TouchActionKind.TouchEnd) {
			domLog('Invoking Circuit.onClicked');

			if (this.circuit.sceneObject == null) {
				throw Error();
			}

			if (this.circuit.sceneObject.onClicked != null) {
				this.circuit.sceneObject.onClicked(this.circuit);
			}
			// domLog(this.circuit.value);
			stateMachine.state = new Home();
		}
	}
}
