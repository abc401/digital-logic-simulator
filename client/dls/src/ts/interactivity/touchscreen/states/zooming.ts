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
import { canvas, viewManager } from '@routes/+page.svelte';
import { domLog, logState } from '@lib/stores/debugging.js';

export class Zooming implements TouchScreenState {
	stateName = 'Zooming';
	constructor(
		private touch1Id: number,
		private touch2Id: number
	) {
		logState('TSZooming');
	}
	update(stateMachine: TouchScreenStateMachine, action: TouchAction): void {
		const boundingRect = canvas.getBoundingClientRect();
		const payload = action.payload;
		const [insideOfCanvas, outsideOfCanvas] = discriminateTouches(payload.changedTouches);
		if (outsideOfCanvas.length > 0) {
			stateMachine.state = new Illegal();
		}

		if (action.kind === TouchActionKind.TouchStart) {
			stateMachine.state = new Illegal();
		}

		if (action.kind === TouchActionKind.TouchMove) {
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
			const newZoomLevel = (viewManager.zoomLevel * zoomRectCurrent.w) / zoomRectPrevious.w;
			viewManager.zoom(zoomOriginScr, newZoomLevel);
			viewManager.pan(zoomRectCurrent.midPoint().sub(zoomRectPrevious.midPoint()));
		} else if (action.kind === TouchActionKind.TouchEnd) {
			if (insideOfCanvas.length === 1) {
				const touch = insideOfCanvas[0];
				if (touch.identifier === this.touch1Id) {
					stateMachine.state = new Panning(this.touch2Id);
				} else if (touch.identifier === this.touch2Id) {
					stateMachine.state = new Panning(this.touch1Id);
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
			} else {
				domLog('[TSZooming][TouchEnd] Ended touch is not one of the touches used for zooming');
				throw Error();
			}
		}
	}
}
