import { Home } from './states/home.js';
import { ZoomUserAction, copySelectedToClipboard, pasteFromClipboard } from '../actions.js';
import { Vec2 } from '@ts/math.js';
import { actionsManager, canvas, viewManager } from '@routes/+page.svelte';

export enum MouseButton {
	None = 0,
	Primary = 1,
	Secondary = 2,
	Auxiliary = 4,
	Fourth = 8,
	Fifth = 16
}

function encodeMouseButton(button: number) {
	if (button === 0) {
		return MouseButton.Primary;
	}
	if (button === 1) {
		return MouseButton.Auxiliary;
	}
	if (button === 2) {
		return MouseButton.Secondary;
	}
	if (button === 3) {
		return MouseButton.Fourth;
	}
	if (button === 4) {
		return MouseButton.Fifth;
	}
	throw Error(`Unexpected Mouse Button: ${button}`);
}

export enum MouseActionKind {
	MouseDown,
	MouseUp,
	MouseMove
}

export class MouseAction {
	kind: MouseActionKind;
	payload: MouseEvent & { buttonEncoded: number };

	constructor(kind: MouseActionKind, payload: MouseEvent) {
		this.kind = kind;
		this.payload = Object.assign(payload, {
			buttonEncoded: encodeMouseButton(payload.button)
		});
	}
}

export interface MouseState {
	update(stateMachine: MouseStateMachine, action: MouseAction): void;
}

export class MouseStateMachine {
	state: MouseState;

	lastZoomAction: ZoomUserAction | undefined;

	zoomLevelDelta: number = 0;
	zoomOriginScr: Vec2 | undefined = undefined;

	nonZoomActionPerformed = false;

	constructor() {
		console.log('[MouseStateMachine]');
		this.state = new Home();

		document.addEventListener('keydown', (ev) => {
			this.nonZoomActionPerformed = true;
			if ((ev.key === 'c' || ev.key === 'C') && ev.ctrlKey) {
				copySelectedToClipboard();
			} else if ((ev.key === 'v' || ev.key === 'V') && ev.ctrlKey) {
				pasteFromClipboard();
			}
		});

		document.addEventListener('mousedown', (ev) => {
			this.nonZoomActionPerformed = true;
			this.state.update(this, new MouseAction(MouseActionKind.MouseDown, ev));
		});

		document.addEventListener('mouseup', (ev) => {
			this.nonZoomActionPerformed = true;
			this.state.update(this, new MouseAction(MouseActionKind.MouseUp, ev));
		});

		document.addEventListener('mousemove', (ev) => {
			// this.nonZoomActionPerformed = true;
			this.state.update(this, new MouseAction(MouseActionKind.MouseMove, ev));
		});

		document.addEventListener(
			'wheel',
			(ev) => {
				// console.log('[Wheel]: ', ev);
				if (ev.target != canvas) {
					return;
				}
				const zoomOriginScr = new Vec2(ev.offsetX, ev.offsetY);
				const zoomDelta = -ev.deltaY * 0.001;

				const lastActionNode = actionsManager.currentNode;

				const thisZoomAction = new ZoomUserAction(zoomOriginScr, zoomDelta);

				if (lastActionNode == undefined || lastActionNode.action.name != 'Zoom') {
					console.log("lastActionNode == undefined || lastActionNode.action.name != 'Zoom'");
					actionsManager.push(thisZoomAction);
				} else {
					console.log('else');
					const lastAction = lastActionNode.action as ZoomUserAction;
					if (
						!lastAction.zoomOriginScr.eq(zoomOriginScr) ||
						Math.sign(lastAction.zoomLevelDelta) !== Math.sign(thisZoomAction.zoomLevelDelta)
					) {
						console.log(
							'!lastAction.zoomOriginScr.eq(zoomOriginScr) || Math.sign(lastAction.zoomLevelDelta) !== Math.sign(thisZoomAction.zoomLevelDelta)'
						);
						actionsManager.push(thisZoomAction);
					} else {
						lastActionNode.action = new ZoomUserAction(
							zoomOriginScr,
							lastAction.zoomLevelDelta + thisZoomAction.zoomLevelDelta
						);
					}
				}

				viewManager.zoom(zoomOriginScr, viewManager.zoomLevel + zoomDelta);

				ev.preventDefault();
				this.nonZoomActionPerformed = false;
			},
			{ passive: false }
		);
	}
}
