import { Wire } from '@ts/scene/objects/wire';
import {
	TouchAction,
	TouchActionKind,
	type TouchScreenState,
	TouchScreenStateMachine,
	discriminateTouches,
	getLocScr
} from '../state-machine';
import { Illegal } from './Illegal';
import { ConcreteObjectKind } from '@ts/scene/scene-manager';
import { ConsumerPin } from '@ts/scene/objects/consumer-pin';
import { ProducerPin } from '@ts/scene/objects/producer-pin';
import { Home } from './home';
import { actionsManager, sceneManager } from '@src/routes/dls/+page.svelte';
import { logState } from '@src/lib/stores/debugging';
import { CreateWireUserAction } from '../../actions';
import { type ID } from '@src/ts/scene/scene';
import { currentScene } from '@stores/currentScene';

export class CreatingWire implements TouchScreenState {
	constructor(private wire: Wire) {
		logState('CreatingWire');
		const currentScene_ = currentScene.get();
		if (currentScene_ == null) {
			throw Error();
		}
		currentScene_.wireBeingCreated = wire;
	}
	update(stateMachine: TouchScreenStateMachine, action: TouchAction): void {
		const payload = action.payload;
		const [insideOfCanvas, outsideOfCanvas] = discriminateTouches(payload.changedTouches);

		if (outsideOfCanvas.length > 0 || action.kind === TouchActionKind.TouchStart) {
			this.wire.detach();
			stateMachine.state = new Illegal();
			return;
		}

		const touch = insideOfCanvas[0];

		const locScr = getLocScr(touch);

		if (action.kind === TouchActionKind.TouchMove) {
			if (this.wire.getProducerPin() == null) {
				this.wire.fromScr = locScr;
			} else if (this.wire.getConsumerPin() == null) {
				this.wire.toScr = locScr;
			}
		}

		if (action.kind === TouchActionKind.TouchEnd) {
			const focusObject = sceneManager.getObjectAt(locScr);
			if (focusObject == null) {
				this.wire.detach();
				stateMachine.state = new Home();
				return;
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
				stateMachine.state = new Home();
				return;
			}
			const currentScene_ = currentScene.get();
			if (currentScene_ == null) {
				throw Error();
			}
			currentScene_.wireBeingCreated = undefined;
			actionsManager.do(new CreateWireUserAction(currentScene_.id as ID, this.wire));
			this.wire.detach();

			stateMachine.state = new Home();
		}
	}
}

// 	if (action.kind === MouseActionKind.MouseUp) {
// 		const focusObject = sceneManager.getObjectAt(locScr);
// 		if (focusObject == null) {
// 			this.wire.detach();
// 			stateMachine.state = new Home();
// 			return;
// 		} else if (
// 			focusObject.kind === ConcreteObjectKind.ConsumerPin &&
// 			this.wire.consumerPin == null
// 		) {
// 			this.wire.setConsumerPin(focusObject.object as ConsumerPin);
// 		} else if (
// 			focusObject.kind === ConcreteObjectKind.ProducerPin &&
// 			this.wire.producerPin == null
// 		) {
// 			this.wire.setProducerPin(focusObject.object as ProducerPin);
// 		} else {
// 			this.wire.detach();
// 			stateMachine.state = new Home();
// 			return;
// 		}
// 		const currentScene_ = currentScene.get();
// 		currentScene_.wireBeingCreated = undefined;
// 		actionsManager.do(new CreateWireUserAction(currentScene_.id as ID, this.wire));
// 		// this.wire.register(currentScene_);
// 		console.log('Wire: ', this.wire);
// 		this.wire.detach();

// 		stateMachine.state = new Home();
// 	}
// }
