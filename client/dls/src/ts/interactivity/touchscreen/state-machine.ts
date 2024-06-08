import { Vec2 } from '@ts/math.js';
import { Home } from './states/home.js';
import { Panning } from './states/panning.js';
import { Zooming } from './states/zooming.js';
import { Illegal } from './states/Illegal.js';
import { canvas } from '@src/routes/dls/+page.svelte';

export function getAppropriateState(touches: TouchList) {
	if (touches.length === 0) {
		return new Home();
	}

	if (touches.length === 1) {
		return new Panning(touches[0].identifier);
	}

	if (touches.length === 2) {
		return new Zooming(touches[0].identifier, touches[1].identifier);
	}

	return new Illegal();
}

export function getLocScr(touch: Touch) {
	const boundingRect = canvas.getBoundingClientRect();
	return new Vec2(touch.clientX - boundingRect.x, touch.clientY - boundingRect.y);
}

export function discriminateTouches(touches: TouchList) {
	const insideOfCanvas = new Array<Touch>();
	const outsideOfCanvas = new Array<Touch>();

	for (let i = 0; i < touches.length; i++) {
		if (touches[i].target === canvas) {
			insideOfCanvas.push(touches[i]);
		} else {
			outsideOfCanvas.push(touches[i]);
		}
	}
	return [insideOfCanvas, outsideOfCanvas];
}

export enum TouchActionKind {
	TouchStart,
	TouchMove,
	TouchEnd
}

export class TouchAction {
	constructor(
		readonly kind: TouchActionKind,
		readonly payload: TouchEvent
	) {}
}

export interface TouchScreenState {
	update(stateMachine: TouchScreenStateMachine, action: TouchAction): void;
}

export function findTouch(id: number, touchList: TouchList) {
	for (let i = 0; i < touchList.length; i++) {
		if (touchList[i].identifier == id) {
			return touchList[i];
		}
	}
	return undefined;
}

export class TouchScreenStateMachine {
	state: TouchScreenState;
	touchLocHistoryScr: Map<number, Vec2>;

	constructor() {
		this.state = new Home();
		this.touchLocHistoryScr = new Map();

		document.addEventListener(
			'touchstart',
			(ev) => {
				if (ev.target === canvas) {
					ev.preventDefault();
				}
				this.state.update(this, new TouchAction(TouchActionKind.TouchStart, ev));

				const boundingRect = canvas.getBoundingClientRect();
				for (let i = 0; i < ev.changedTouches.length; i++) {
					const touch = ev.changedTouches[i];
					this.touchLocHistoryScr.set(
						touch.identifier,
						new Vec2(touch.clientX - boundingRect.x, touch.clientY - boundingRect.y)
					);
				}
			},
			{ passive: false }
		);

		document.addEventListener(
			'touchmove',
			(ev) => {
				if (ev.target === canvas) {
					ev.preventDefault();
				}
				this.state.update(this, new TouchAction(TouchActionKind.TouchMove, ev));

				const boundingRect = canvas.getBoundingClientRect();
				for (let i = 0; i < ev.changedTouches.length; i++) {
					const touch = ev.changedTouches[i];
					this.touchLocHistoryScr.set(
						touch.identifier,
						new Vec2(touch.clientX - boundingRect.x, touch.clientY - boundingRect.y)
					);
				}
			},
			{ passive: false }
		);

		document.addEventListener(
			'touchcancel',
			(ev) => {
				if (ev.target === canvas) {
					ev.preventDefault();
				}
				this.state.update(this, new TouchAction(TouchActionKind.TouchEnd, ev));

				for (let i = 0; i < ev.changedTouches.length; i++) {
					this.touchLocHistoryScr.delete(ev.changedTouches[i].identifier);
				}
			},
			{ passive: false }
		);

		document.addEventListener(
			'touchend',
			(ev) => {
				if (ev.target === canvas) {
					ev.preventDefault();
				}
				this.state.update(this, new TouchAction(TouchActionKind.TouchEnd, ev));

				for (let i = 0; i < ev.changedTouches.length; i++) {
					this.touchLocHistoryScr.delete(ev.changedTouches[i].identifier);
				}
			},
			{ passive: false }
		);
	}
}
