import type { CircuitSceneObject } from '@src/ts/scene/objects/circuits/circuit';
import {
	TouchActionKind,
	discriminateTouches,
	getLocScr,
	type TouchAction,
	type TouchScreenState,
	type TouchScreenStateMachine
} from '../state-machine';
import { Vec2 } from '@src/ts/math';
import { logState } from '@src/lib/stores/debugging';
import { actionsManager } from '@src/routes/dls/+page.svelte';
import { Illegal } from './Illegal';
import { Zooming } from './zooming';
import type { ID } from '@src/ts/scene/scene';
import {
	DeselectAllUserAction,
	DeselectCircuitUserAction,
	SelectCircuitUserAction
} from '../../actions';
import { Home } from './home';
import { Panning } from './panning';
import { DraggingSelection } from './dragging-selection';

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
			console.log('touchmove');
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
				const locScr = getLocScr(touch);
				stateMachine.state = new DraggingSelection(
					this.touchID,
					this.circuit,
					this.offsetWrl,
					locScr
				);
			}
		} else if (action.kind === TouchActionKind.TouchEnd) {
			if (this.circuit != null) {
				if (this.circuit.isSelected) {
					actionsManager.do(new DeselectCircuitUserAction(this.circuit.id as ID));
				} else {
					actionsManager.do(new SelectCircuitUserAction(this.circuit.id as ID));
				}
			} else {
				actionsManager.do(new DeselectAllUserAction());
			}
			stateMachine.state = new Home();
			return;
		}
	}
}
