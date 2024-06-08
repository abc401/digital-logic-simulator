import {
	TouchAction,
	TouchActionKind,
	type TouchScreenState,
	TouchScreenStateMachine,
	discriminateTouches,
	findTouch
} from '../state-machine.js';
import { Rect, Vec2 } from '@ts/math.js';
import { Panning } from './panning.js';
import { Home } from './home.js';
import { Illegal } from './Illegal.js';
import { actionsManager, canvas, view } from '@src/routes/dls/+page.svelte';
import { domLog, logState } from '@lib/stores/debugging.js';
import type { View } from '@src/ts/view-manager.js';
import { TouchScreenZoomUserAction } from '../../actions.js';

export class Zooming implements TouchScreenState {
	startingView: View;
	stateName = 'Zooming';
	constructor(
		private touch1Id: number,
		private touch2Id: number
	) {
		logState('TSZooming');
		this.startingView = view.clone();
	}
	update(stateMachine: TouchScreenStateMachine, action: TouchAction): void {
		const boundingRect = canvas.getBoundingClientRect();
		const payload = action.payload;
		const [insideOfCanvas, outsideOfCanvas] = discriminateTouches(payload.changedTouches);
		if (outsideOfCanvas.length > 0) {
			stateMachine.state = new Illegal();
			this.configAction();
			return;
		}

		if (action.kind === TouchActionKind.TouchStart) {
			stateMachine.state = new Illegal();
			this.configAction();
		} else if (action.kind === TouchActionKind.TouchMove) {
			const touch1 = findTouch(this.touch1Id, payload.changedTouches);
			const touch2 = findTouch(this.touch2Id, payload.changedTouches);

			if (touch1 == null && touch2 == null) {
				domLog('[TSZooming][TouchMove] touch1 == null && touch2 == null');
				throw Error();
			}

			const previousLocScr1 = stateMachine.touchLocHistoryScr.get(this.touch1Id);
			const previousLocScr2 = stateMachine.touchLocHistoryScr.get(this.touch2Id);

			if (previousLocScr1 == null || previousLocScr2 == null) {
				domLog('[TSZooming][TouchMove] no previous locations of touches.');
				throw Error();
			}

			const zoomRectPrevious = Rect.fromEndPoints(previousLocScr1, previousLocScr2)
				.forceAspectRatio(1)
				.withMidPoint(previousLocScr1.lerp(previousLocScr2, 1 / 2));

			const touch1LocScr =
				touch1 == null
					? previousLocScr1
					: new Vec2(touch1.clientX - boundingRect.x, touch1.clientY - boundingRect.y);
			const touch2LocScr =
				touch2 == null
					? previousLocScr2
					: new Vec2(touch2.clientX - boundingRect.x, touch2.clientY - boundingRect.y);

			const zoomRectCurrent = Rect.fromEndPoints(touch1LocScr, touch2LocScr)
				.forceAspectRatio(1)
				.withMidPoint(touch1LocScr.lerp(touch2LocScr, 1 / 2));
			const zoomOriginScr = zoomRectCurrent.midPoint();
			const newZoomLevel = (view.zoomLevel * zoomRectCurrent.w) / zoomRectPrevious.w;
			view.zoom(zoomOriginScr, newZoomLevel);
			view.pan(zoomRectCurrent.midPoint().sub(zoomRectPrevious.midPoint()));
		} else if (action.kind === TouchActionKind.TouchEnd) {
			if (insideOfCanvas.length === 1) {
				const touch = insideOfCanvas[0];
				if (touch.identifier === this.touch1Id) {
					stateMachine.state = new Panning(this.touch2Id);
					this.configAction();
				} else if (touch.identifier === this.touch2Id) {
					stateMachine.state = new Panning(this.touch1Id);
					this.configAction();
				} else {
					domLog('[TSZooming][TouchEnd] Ended touch is not one of the touches used for zooming');
					throw Error();
				}
			} else if (insideOfCanvas.length === 2) {
				const touch1 = findTouch(this.touch1Id, payload.changedTouches);
				const touch2 = findTouch(this.touch2Id, payload.changedTouches);
				if (touch1 == null || touch2 == null) {
					domLog('[TSZooming][TouchEnd] Ended touch is not one of the touches used for zooming');
					throw Error();
				}
				stateMachine.state = new Home();
				this.configAction();
			} else {
				domLog('[TSZooming][TouchEnd] Ended touch is not one of the touches used for zooming');
				throw Error();
			}
		}
	}

	configAction() {
		const endingView = view.clone();
		const zoomDelta = endingView.zoomLevel - this.startingView.zoomLevel;
		const panDelta = endingView.panOffset.sub(this.startingView.panOffset);
		if (zoomDelta !== 0 || !panDelta.isZero()) {
			actionsManager.push(new TouchScreenZoomUserAction(this.startingView, endingView));
		}
	}
}
