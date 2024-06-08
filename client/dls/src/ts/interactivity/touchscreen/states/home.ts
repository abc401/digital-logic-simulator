import { logState } from '@src/lib/stores/debugging';
import { canvas, sceneManager, view } from '@src/routes/dls/+page.svelte';
import { Vec2 } from '@src/ts/math';
import type { Circuit } from '@src/ts/scene/objects/circuits/circuit';
import type { ConsumerPin } from '@src/ts/scene/objects/consumer-pin';
import type { ProducerPin } from '@src/ts/scene/objects/producer-pin';
import { Wire } from '@src/ts/scene/objects/wire';
import { ConcreteObjectKind } from '@src/ts/scene/scene-manager';
import {
	type TouchScreenState,
	TouchScreenStateMachine,
	TouchAction,
	discriminateTouches,
	TouchActionKind
} from '../state-machine';
import { Illegal } from './Illegal';
import { CreatingWire } from './creating-wire';
import { SingleTouch } from './single-touch';
import { Zooming } from './zooming';

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

		const boundingRect = canvas.getBoundingClientRect();

		if (action.kind !== TouchActionKind.TouchStart) {
			return;
		}

		if (insideOfCanvas.length === 1) {
			const touch = insideOfCanvas[0];
			const locScr = new Vec2(touch.clientX - boundingRect.x, touch.clientY - boundingRect.y);

			const focusObject = sceneManager.getObjectAt(locScr);
			if (focusObject == null) {
				stateMachine.state = new SingleTouch(touch.identifier);
				return;
			}
			// if (focusObject == null) {
			// 	stateMachine.state = new Panning(touch.identifier);
			// 	return;
			// }

			if (focusObject.kind === ConcreteObjectKind.Circuit) {
				const circuit = focusObject.object as Circuit;
				if (circuit.sceneObject == null) {
					throw Error();
				}

				if (circuit.sceneObject == null || circuit.sceneObject.id == null) {
					throw Error();
				}

				stateMachine.state = new SingleTouch(
					touch.identifier,
					circuit.sceneObject,
					circuit.sceneObject.tightRectWrl.xy.sub(view.screenToWorld(locScr))
				);

				// stateMachine.state = new CircuitSelected(
				// 	circuit,
				// 	touch.identifier,
				// 	circuit.sceneObject.tightRectWrl.xy.sub(viewManager.screenToWorld(locScr))
				// );
			}
			if (focusObject.kind === ConcreteObjectKind.ConsumerPin) {
				const pin = focusObject.object as ConsumerPin;

				if (pin.wire != null) {
					pin.wire.detach();
				}

				const wire = Wire.newUnregistered(undefined, pin);
				wire.fromScr = locScr;

				stateMachine.state = new CreatingWire(wire);
				return;
			}
			if (focusObject.kind === ConcreteObjectKind.ProducerPin) {
				const pin = focusObject.object as ProducerPin;
				const wire = Wire.newUnregistered(pin, undefined);
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
