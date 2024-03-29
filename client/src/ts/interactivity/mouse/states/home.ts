import {
	MouseAction,
	MouseActionKind,
	MouseStateMachine,
	type MouseState,
	MouseButton
} from '../state-machine.js';
import { ConcreteObjectKind } from '@ts/scene/scene-manager.js';
import type { Circuit } from '@ts/scene/objects/circuits/circuit.js';
import { ProducerPin } from '@ts/scene/objects/producer-pin.js';
import { ConsumerPin } from '@ts/scene/objects/consumer-pin.js';
import { Wire } from '@ts/scene/objects/wire.js';
import { Vec2 } from '@ts/math.js';
import { CreatingWire } from './creating-wire.js';
import { MouseDownPrimaryButton } from './mouse-down-primary-button.js';
import { sceneManager, viewManager } from '@routes/+page.svelte';
import { logState } from '@lib/stores/debugging.js';

export class Home implements MouseState {
	constructor() {
		logState('Home');
	}
	update(stateMachine: MouseStateMachine, action: MouseAction) {
		const payload = action.payload;
		const locScr = new Vec2(payload.offsetX, payload.offsetY);

		if (action.kind === MouseActionKind.MouseDown) {
			if (payload.buttonEncoded !== MouseButton.Primary) {
				return;
			}

			let focusObject = sceneManager.getObjectAt(locScr);

			if (focusObject == null) {
				console.log('Focus Object == null');

				stateMachine.state = new MouseDownPrimaryButton();
				return;
			}

			console.log('Focus Object kind: ', focusObject.kind);

			if (focusObject.kind === ConcreteObjectKind.Circuit) {
				const circuit = focusObject.object as Circuit;

				if (circuit.sceneObject == null) {
					throw Error();
				}

				stateMachine.state = new MouseDownPrimaryButton(
					circuit.sceneObject,
					circuit.sceneObject.tightRectWrl.xy.sub(viewManager.screenToWorld(locScr))
				);

				return;
			}

			if (focusObject.kind === ConcreteObjectKind.ProducerPin) {
				const pin = focusObject.object as ProducerPin;
				const wire = new Wire(pin, undefined);
				wire.toScr = locScr;
				stateMachine.state = new CreatingWire(wire);
				return;
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
		}
	}
}
