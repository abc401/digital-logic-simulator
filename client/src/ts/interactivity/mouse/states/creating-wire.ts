import { ProducerPin } from '@ts/scene/objects/producer-pin.js';
import { ConsumerPin } from '@ts/scene/objects/consumer-pin.js';
import { Wire } from '@ts/scene/objects/wire.js';
import {
	MouseAction,
	MouseActionKind,
	type MouseState,
	MouseStateMachine
} from '../state-machine.js';
import { Home } from './home.js';
import { ConcreteObjectKind } from '@ts/scene/scene-manager.js';
import { Vec2 } from '@ts/math.js';
import { sceneManager } from '@routes/+page.svelte';
import { logState } from '@lib/stores/debugging.js';

export class CreatingWire implements MouseState {
	constructor(private wire: Wire) {
		logState('CreatingWire');
		// console.log("Wire: ", wire);
		// console.log("consumerPin: ", wire.getConsumerPin()?.wire);
	}

	update(stateMachine: MouseStateMachine, action: MouseAction) {
		const payload = action.payload;
		const locScr = new Vec2(payload.offsetX, payload.offsetY);

		if (action.kind === MouseActionKind.MouseMove) {
			if (this.wire.getProducerPin() == null) {
				this.wire.fromScr = locScr;
			} else if (this.wire.getConsumerPin() == null) {
				this.wire.toScr = locScr;
			}
		}

		if (action.kind === MouseActionKind.MouseUp) {
			const focusObject = sceneManager.getObjectAt(locScr);
			if (focusObject == null) {
				this.wire.detach();
			} else if (
				focusObject.kind === ConcreteObjectKind.ConsumerPin &&
				this.wire.consumerPin == null
			) {
				this.wire.setConsumerPin(focusObject.object as ConsumerPin);
			} else if (
				focusObject.kind === ConcreteObjectKind.ProducerPin &&
				this.wire.producerPin == null
			) {
				this.wire.setProducerPin(focusObject.object as ProducerPin);
			} else {
				this.wire.detach();
			}

			console.log('Wire: ', this.wire);
			stateMachine.state = new Home();
		}
	}
}
