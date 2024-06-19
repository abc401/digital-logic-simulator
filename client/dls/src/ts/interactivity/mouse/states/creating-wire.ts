import { ProducerPin } from '@ts/scene/objects/producer-pin';
import { ConsumerPin } from '@ts/scene/objects/consumer-pin';
import { Wire } from '@ts/scene/objects/wire';
import { MouseAction, MouseActionKind, type MouseState, MouseStateMachine } from '../state-machine';
import { Home } from './home';
import { ConcreteObjectKind } from '@ts/scene/scene-manager';
import { Vec2 } from '@ts/math';
import { actionsManager, canvas, sceneManager } from '@src/routes/dls/+page.svelte';
import { logState } from '@lib/stores/debugging';
import { type ID } from '@src/ts/scene/scene';
import { currentScene } from '@stores/currentScene';
import { CreateWireUserAction, DeleteWireUserAction } from '../../actions';

export class CreatingWire implements MouseState {
	constructor(private wire: Wire) {
		logState('CreatingWire');
		const currentScene_ = currentScene.get();
		if (currentScene_ == null) {
			throw Error();
		}
		currentScene_.wireBeingCreated = wire;

		// console.log("Wire: ", wire);
		// console.log("consumerPin: ", wire.getConsumerPin()?.wire);
	}

	update(stateMachine: MouseStateMachine, action: MouseAction) {
		const payload = action.payload;
		if (payload.target != canvas) {
			return;
		}
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
				stateMachine.state = new Home();
				return;
			} else if (
				focusObject.kind === ConcreteObjectKind.ConsumerPin &&
				this.wire.consumerPin == null
			) {
				const pin = focusObject.object as ConsumerPin;
				if (pin.wire != null) {
					const currentScene_ = currentScene.get();
					if (currentScene_ == null) {
						throw Error();
					}
					actionsManager.do(new DeleteWireUserAction(pin.wire, currentScene_.id as ID));
				}

				this.wire.setConsumerPin(pin);
			} else if (
				focusObject.kind === ConcreteObjectKind.ProducerPin &&
				this.wire.producerPin == null
			) {
				this.wire.setProducerPin(focusObject.object as ProducerPin);
			} else {
				this.wire.detach();
				stateMachine.state = new Home();
				return;
			}
			const currentScene_ = currentScene.get();
			if (currentScene_ == null) {
				throw Error();
			}
			currentScene_.wireBeingCreated = undefined;
			actionsManager.do(new CreateWireUserAction(currentScene_.id as ID, this.wire));
			// this.wire.register(currentScene_);
			console.log('Wire: ', this.wire);
			this.wire.detach();

			stateMachine.state = new Home();
		}
	}
}
