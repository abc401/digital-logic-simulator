import {
	TouchAction,
	TouchActionKind,
	type TouchScreenState,
	TouchScreenStateMachine,
	discriminateTouches,
	getLocScr
} from '../state-machine.js';
import { type Circuit } from '@ts/scene/objects/circuits/circuit.js';
import { Illegal } from './Illegal.js';
import { Home as TouchScreenHome } from './home';
import { Home as MouseHome } from '@ts/interactivity/mouse/states/home.js';
import { actionsManager, mouseStateMachine, sceneManager } from '@src/routes/dls/+page.svelte';
import { logState } from '@lib/stores/debugging.js';
import { CreateCircuitUserAction } from '../../actions.js';

export class CreatingCircuit implements TouchScreenState {
	constructor(
		private name: string,
		private creator: () => Circuit
	) {
		logState(`CreatingCircuit(${this.name})`);
	}
	update(stateMachine: TouchScreenStateMachine, action: TouchAction): void {
		const payload = action.payload;
		const [insideOfCanvas, outsideOfCanvas] = discriminateTouches(payload.changedTouches);

		if (outsideOfCanvas.length > 0) {
			stateMachine.state = new Illegal();
			return;
		}
		if (action.kind === TouchActionKind.TouchEnd) {
			const touch = insideOfCanvas[0];
			const locScr = getLocScr(touch);

			const currentScene = sceneManager.getCurrentScene();
			if (currentScene.id == null) {
				throw Error();
			}

			actionsManager.do(
				new CreateCircuitUserAction(currentScene.id, this.name, this.creator, locScr)
			);

			mouseStateMachine.state = new MouseHome();
			stateMachine.state = new TouchScreenHome();
		}
	}
}
