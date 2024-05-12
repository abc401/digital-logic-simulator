import type { CircuitSceneObject } from '@src/ts/scene/objects/circuits/circuit';
import {
	TouchActionKind,
	discriminateTouches,
	type TouchAction,
	type TouchScreenState,
	type TouchScreenStateMachine
} from '../state-machine';
import { Vec2 } from '@src/ts/math';
import { logState } from '@src/lib/stores/debugging';
import { actionsManager, canvas } from '@src/routes/+page.svelte';
import { Illegal } from './Illegal';
import { Zooming } from './zooming';
import type { ID } from '@src/ts/scene/scene';
import { DeselectAllUserAction, SelectCircuitUserAction } from '../../actions';
import { Home } from './home';
import { Panning } from './panning';
// import { Panning } from './panning';
// import { Home } from './home';
// import { DeselectAllUserAction, SelectCircuitUserAction } from '../../actions';
// import type { ID } from '@src/ts/scene/scene';
// import { Dragging } from './dragging';

export class SingleTouch implements TouchScreenState {
	constructor(
		private touchID: number,
		private circuit: CircuitSceneObject | undefined = undefined,
		private offsetWrl: Vec2 | undefined = undefined
	) {
		if (this.circuit != null) {
			if (this.circuit.id == null) {
				throw Error();
			}
		}

		logState('SingleTouch');
	}

	update(stateMachine: TouchScreenStateMachine, action: TouchAction): void {
		const boundingRect = canvas.getBoundingClientRect();
		const payload = action.payload;
		const [insideOfCanvas, outsideOfCanvas] = discriminateTouches(payload.changedTouches);
		if (outsideOfCanvas.length > 0) {
			stateMachine.state = new Illegal();
		}

		if (action.kind === TouchActionKind.TouchStart) {
			if (insideOfCanvas.length > 1) {
				stateMachine.state = new Illegal();
				return;
			}
			const secondTouch = insideOfCanvas[0];

			stateMachine.state = new Zooming(this.touchID, secondTouch.identifier);
		} else if (action.kind === TouchActionKind.TouchMove) {
			if (this.circuit == null) {
				stateMachine.state = new Panning(this.touchID);
			} else {
				if (this.offsetWrl == null) {
					throw Error();
				}
				if (!this.circuit.isSelected) {
					actionsManager.do(new DeselectAllUserAction());
				}
				actionsManager.do(new SelectCircuitUserAction(this.circuit.id as ID));
				const touch = insideOfCanvas[0];
				const locScr = new Vec2(touch.clientX - boundingRect.x, touch.clientY - boundingRect.y);
				// stateMachine.state = new Dragging(this.circuit, this.touchID, this.offsetWrl);
			}
		} else if (action.kind === TouchActionKind.TouchEnd) {
			stateMachine.state = new Home();
			return;
		}

		// if (action.kind === MouseActionKind.MouseMove) {
		// 	if (this.circuit == null) {
		// 		stateMachine.state = new Panning();
		// 		return;
		// 	} else {
		// 		if (this.offsetWrl == null) {
		// 			throw Error();
		// 		}

		// 		if (!this.circuit.isSelected) {
		// 			actionsManager.do(new DeselectAllUserAction());
		// 			// sceneManager.deselectAll();
		// 		}
		// 		// sceneManager.selectCircuit(this.circuit.id as ID);
		// 		actionsManager.do(new SelectCircuitUserAction(this.circuit.id as ID));
		// 		const locScr = new Vec2(payload.offsetX, payload.offsetY);

		// 		stateMachine.state = new DraggingSelection(this.circuit, this.offsetWrl, locScr);
		// 		return;
		// 	}
		// }
	}
}
