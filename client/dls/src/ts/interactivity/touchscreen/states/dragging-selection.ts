import { Vec2 } from '@src/ts/math';
import {
	TouchActionKind,
	discriminateTouches,
	getLocScr,
	type TouchAction,
	type TouchScreenState,
	type TouchScreenStateMachine
} from '../state-machine';
import { actionsManager, view } from '@src/routes/dls/+page.svelte';
import type { CircuitSceneObject } from '@src/ts/scene/objects/circuits/circuit';
import { logState } from '@src/lib/stores/debugging';
import { DragUserAction, dragSelection } from '../../actions';
import { Illegal } from './Illegal';
import { Zooming } from './zooming';
import { Home } from './home';

export class DraggingSelection implements TouchScreenState {
	totalDeltaWrl: Vec2 = new Vec2(0, 0);

	constructor(
		readonly touchID: number,
		private focusCircuit: CircuitSceneObject,
		private draggingOffsetWrl: Vec2,
		touchLocScr: Vec2 | undefined = undefined
	) {
		if (touchLocScr == null) {
			return;
		}

		this.dragCircuits(touchLocScr);

		logState('Dragging Selection');
	}

	update(stateMachine: TouchScreenStateMachine, action: TouchAction): void {
		const payload = action.payload;

		const [insideOfCanvas, outsideOfCanvas] = discriminateTouches(payload.changedTouches);
		if (outsideOfCanvas.length > 0) {
			stateMachine.state = new Illegal();
		}

		if (action.kind === TouchActionKind.TouchStart) {
			if (insideOfCanvas.length === 1) {
				const touch = insideOfCanvas[0];
				stateMachine.state = new Zooming(this.touchID, touch.identifier);
			} else {
				stateMachine.state = new Illegal();
			}
		} else if (action.kind === TouchActionKind.TouchMove) {
			const touch = insideOfCanvas[0];
			const locScr = getLocScr(touch);
			this.dragCircuits(locScr);
		} else if (action.kind === TouchActionKind.TouchEnd) {
			if (this.totalDeltaWrl.x !== 0 || this.totalDeltaWrl.y !== 0) {
				actionsManager.push(new DragUserAction(this.totalDeltaWrl));
			}
			stateMachine.state = new Home();
		}
	}

	dragCircuits(mouseLocScr: Vec2) {
		const focusCircuitNewPositionWrl = view.screenToWorld(mouseLocScr).add(this.draggingOffsetWrl);

		const deltaWrl = focusCircuitNewPositionWrl.sub(this.focusCircuit.tightRectWrl.xy);
		this.totalDeltaWrl = this.totalDeltaWrl.add(deltaWrl);

		dragSelection(deltaWrl);
	}
}
