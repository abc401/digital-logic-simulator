import {
	MouseAction,
	MouseActionKind,
	MouseStateMachine,
	type MouseState,
	MouseButton
} from '../state-machine';
import { ConcreteObjectKind } from '@ts/scene/scene-manager';
import type { Circuit } from '@ts/scene/objects/circuits/circuit';
import { ProducerPin } from '@ts/scene/objects/producer-pin';
import { ConsumerPin } from '@ts/scene/objects/consumer-pin';
import { Wire } from '@ts/scene/objects/wire';
import { Vec2 } from '@ts/math';
import { CreatingWire } from './creating-wire';
import { MouseDownPrimaryButton } from './mouse-down-primary-button';
import { actionsManager, canvas, sceneManager, view } from '@src/routes/dls/+page.svelte';
import { logState } from '@lib/stores/debugging';
import { type ID } from '@src/ts/scene/scene';
import { currentScene } from '@stores/currentScene';
import { DeleteWireUserAction } from '../../actions';

export class Home implements MouseState {
	constructor() {
		logState('Home');
	}

	update(stateMachine: MouseStateMachine, action: MouseAction) {
		const payload = action.payload;

		if (payload.target != canvas) {
			return;
		}
		const locScr = new Vec2(payload.offsetX, payload.offsetY);

		if (action.kind === MouseActionKind.MouseDown) {
			if (payload.buttonEncoded !== MouseButton.Primary) {
				return;
			}

			const focusObject = sceneManager.getObjectAt(locScr);

			if (focusObject == null) {
				console.log('Focus Object == null');
				// if (!payload.ctrlKey) {
				// 	sceneManager.clearSelectedCircuits();
				// }

				stateMachine.state = new MouseDownPrimaryButton();
				return;
			}

			console.log('Focus Object kind: ', focusObject.kind);

			if (focusObject.kind === ConcreteObjectKind.Circuit) {
				const circuit = focusObject.object as Circuit;

				if (circuit.sceneObject == null || circuit.sceneObject.id == null) {
					throw Error();
				}

				stateMachine.state = new MouseDownPrimaryButton(
					circuit.sceneObject,
					circuit.sceneObject.tightRectWrl.xy.sub(view.screenToWorld(locScr))
				);

				return;
			}

			if (focusObject.kind === ConcreteObjectKind.ProducerPin) {
				const pin = focusObject.object as ProducerPin;
				const wire = Wire.newUnregistered(pin, undefined);
				// new Wire(pin, undefined);
				wire.toScr = locScr;
				stateMachine.state = new CreatingWire(wire);
				return;
			}

			if (focusObject.kind === ConcreteObjectKind.ConsumerPin) {
				const pin = focusObject.object as ConsumerPin;

				if (pin.wire != null) {
					const currentScene_ = currentScene.get();
					if (currentScene_ == null) {
						throw Error();
					}
					actionsManager.do(new DeleteWireUserAction(pin.wire, currentScene_.id as ID));
					// pin.wire.detach();
				}

				const wire = Wire.newUnregistered(undefined, pin);
				// new Wire(undefined, pin);
				wire.fromScr = locScr;

				stateMachine.state = new CreatingWire(wire);
				return;
			}
		}
	}
}
