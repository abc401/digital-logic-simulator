import {
	TouchAction,
	TouchActionKind,
	type TouchScreenState,
	TouchScreenStateMachine,
	discriminateTouches
} from '../state-machine.js';
import { Vec2 } from '@ts/math.js';
import type { Circuit } from '@ts/scene/objects/circuit.js';
import { Panning } from './panning.js';
import { Zooming } from './zooming.js';
import { ConcreteObjectKind } from '@ts/scene/scene-manager.js';
import { Illegal } from './Illegal.js';
import { ConsumerPin } from '@ts/scene/objects/consumer-pin.js';
import { Wire } from '@ts/scene/objects/wire.js';
import { CreatingWire } from './creating-wire.js';
import { ProducerPin } from '@ts/scene/objects/producer-pin.js';
import { CircuitSelected } from './circuit-selected.js';
import { canvas, sceneManager, viewManager } from '@routes/+page.svelte';
import { logState } from '@lib/stores/debugging.js';

export class Home implements TouchScreenState {
	constructor() {
		logState('TSHome');
	}
	update(stateMachine: TouchScreenStateMachine, action: TouchAction): void {
		const payload = action.payload;
		const [insideOfCanvas, outsideOfCanvas] = discriminateTouches(payload.changedTouches);

		if (outsideOfCanvas.length > 0) {
			stateMachine.state = new Illegal();
			return;
		}

		let boundingRect = canvas.getBoundingClientRect();

		if (action.kind !== TouchActionKind.TouchStart) {
			return;
		}

		if (insideOfCanvas.length === 1) {
			const touch = insideOfCanvas[0];
			const locScr = new Vec2(touch.clientX - boundingRect.x, touch.clientY - boundingRect.y);

			const focusObject = sceneManager.getObjectAt(locScr);
			if (focusObject == null) {
				stateMachine.state = new Panning(touch.identifier);
				return;
			}

			if (focusObject.kind === ConcreteObjectKind.Circuit) {
				const circuit = focusObject.object as Circuit;
				if (circuit.sceneObject == null) {
					throw Error();
				}

				stateMachine.state = new CircuitSelected(
					circuit,
					touch.identifier,
					circuit.sceneObject.tightRectWrl.xy.sub(viewManager.screenToWorld(locScr))
				);
			}
			if (focusObject.kind === ConcreteObjectKind.ConsumerPin) {
				const pin = focusObject.object as ConsumerPin;

				if (pin.wire != null) {
					pin.wire.detach();
				}

				const wire = new Wire(undefined, pin);
				wire.fromScr = locScr;

				stateMachine.state = new CreatingWire(wire);
				return;
			}
			if (focusObject.kind === ConcreteObjectKind.ProducerPin) {
				const pin = focusObject.object as ProducerPin;
				let wire = new Wire(pin, undefined);
				wire.toScr = locScr;
				stateMachine.state = new CreatingWire(wire);
				return;
			}
		} else if (insideOfCanvas.length === 2) {
			const touch1 = payload.changedTouches[0];
			const touch2 = payload.changedTouches[1];
			stateMachine.state = new Zooming(touch1.identifier, touch2.identifier);
		} else {
			stateMachine.state = new Illegal();
		}
	}
}
