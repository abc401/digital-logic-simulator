import {
	TouchAction,
	TouchActionKind,
	type TouchScreenState,
	TouchScreenStateMachine,
	discriminateTouches,
	getLocScr
} from '../state-machine.js';
import { Vec2 } from '@ts/math.js';
import { Home } from './home.js';
import { Zooming } from './zooming.js';
import { Illegal } from './Illegal.js';
import { actionsManager, view } from '@src/routes/dls/+page.svelte';
import { domLog, logState } from '@lib/stores/debugging.js';
import { PanUserAction } from '../../actions.js';

export class Panning implements TouchScreenState {
	totalDelta: Vec2 = new Vec2(0, 0);

	constructor(readonly touchId: number) {
		logState('TSPanning');
	}
	update(stateMachine: TouchScreenStateMachine, action: TouchAction): void {
		const payload = action.payload;
		const [insideOfCanvas, outsideOfCanvas] = discriminateTouches(payload.changedTouches);

		if (outsideOfCanvas.length > 0) {
			stateMachine.state = new Illegal();
		}

		if (action.kind === TouchActionKind.TouchStart) {
			if (insideOfCanvas.length === 1) {
				const touch1Id = this.touchId;
				const touch2Id = payload.changedTouches[0].identifier;
				stateMachine.state = new Zooming(touch1Id, touch2Id);
			} else {
				stateMachine.state = new Illegal();
			}
			if (this.totalDelta.x !== 0 || this.totalDelta.y !== 0) {
				actionsManager.push(new PanUserAction(this.totalDelta));
			}
		} else if (action.kind === TouchActionKind.TouchMove) {
			const touch = payload.changedTouches[0];
			const locScr = getLocScr(touch);
			// const locScr = new Vec2(touch.clientX - boundingRect.x, touch.clientY - boundingRect.y);

			const previousLocScr = stateMachine.touchLocHistoryScr.get(this.touchId);
			if (previousLocScr == null) {
				domLog(`[TSPanning(Err)][TouchMove] No history for touch location`);
				throw Error();
			}
			const delta = locScr.sub(previousLocScr);
			this.totalDelta = this.totalDelta.add(delta);

			view.pan(delta);
		} else if (action.kind === TouchActionKind.TouchEnd) {
			stateMachine.state = new Home();
			if (this.totalDelta.x !== 0 || this.totalDelta.y !== 0) {
				actionsManager.push(new PanUserAction(this.totalDelta));
			}
		}
	}
}
