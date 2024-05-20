import { Home } from './states/home.js';
import { ZoomUserAction, copySelectedToClipboard, pasteFromClipboard } from '../actions.js';
import { Vec2 } from '@ts/math.js';
import { actionsManager, canvas, view } from '@routes/+page.svelte';

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

	// lastZoomAction: ZoomUserAction | undefined;

	// zoomLevelDelta: number = 0;
	// zoomOriginScr: Vec2 | undefined = undefined;

	// nonZoomActionPerformed = false;

	constructor() {
		console.log('[MouseStateMachine]');
		this.state = new Home();

		document.addEventListener('keydown', (ev) => {
			const activeElement = document.activeElement;
			if (activeElement != null) {
				const tagName = activeElement.tagName;
				if (
					(tagName.toLowerCase() === 'input' &&
						(activeElement as HTMLInputElement).type === 'text') ||
					tagName.toLowerCase() === 'textarea'
				) {
					return;
				}
			}

			// console.log('target: ', ev.target);
			if (!ev.ctrlKey) {
				return;
			}

			if (ev.key === 'c' || ev.key === 'C') {
				copySelectedToClipboard();
			} else if (ev.key === 'v' || ev.key === 'V') {
				pasteFromClipboard();
			}

			if (ev.key.toLowerCase() == 'z' && ev.shiftKey) {
				actionsManager.redo();
				console.log('Redo');
			} else if (ev.key.toLowerCase() == 'z') {
				actionsManager.undo();
				console.log('Undo');
			}
		});

		document.addEventListener('mousedown', (ev) => {
			this.state.update(this, new MouseAction(MouseActionKind.MouseDown, ev));
		});

		document.addEventListener('mouseup', (ev) => {
			this.state.update(this, new MouseAction(MouseActionKind.MouseUp, ev));
		});

		document.addEventListener('mousemove', (ev) => {
			this.state.update(this, new MouseAction(MouseActionKind.MouseMove, ev));
		});

		document.addEventListener(
			'wheel',
			(ev) => {
				if (ev.target != canvas) {
					return;
				}
				// actionsManager.autoRetrySaving = false;
				const zoomOriginScr = new Vec2(ev.offsetX, ev.offsetY);
				const zoomDelta = -ev.deltaY * 0.001;

				const lastTmpAction = actionsManager.lastTmpAction();

				const thisZoomAction = new ZoomUserAction(zoomOriginScr, zoomDelta);

				if (lastTmpAction == undefined || lastTmpAction.name != 'Zoom') {
					console.log("lastActionNode == undefined || lastActionNode.action.name != 'Zoom'");
					actionsManager.pushTmp(thisZoomAction);
					// actionsManager.autoRetrySaving = true;
				} else {
					console.log('else');
					const lastAction = lastTmpAction as ZoomUserAction;
					if (
						!lastAction.zoomOriginScr.eq(zoomOriginScr) ||
						Math.sign(lastAction.zoomLevelDelta) !== Math.sign(thisZoomAction.zoomLevelDelta)
					) {
						console.log(
							'!lastAction.zoomOriginScr.eq(zoomOriginScr) || Math.sign(lastAction.zoomLevelDelta) !== Math.sign(thisZoomAction.zoomLevelDelta)'
						);
						actionsManager.commitTmpHistory();
						actionsManager.pushTmp(thisZoomAction);
						// actionsManager.autoRetrySaving = true;
					} else {
						lastAction.zoomLevelDelta += thisZoomAction.zoomLevelDelta;
					}
				}

				view.zoom(zoomOriginScr, view.zoomLevel + zoomDelta);

				ev.preventDefault();
			},
			{ passive: false }
		);
	}
}
