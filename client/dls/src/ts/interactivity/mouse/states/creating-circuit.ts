import {
	actionsManager,
	canvas,
	sceneManager,
	touchScreenStateMachine
} from '@src/routes/dls/+page.svelte';
import {
	MouseAction,
	MouseActionKind,
	MouseStateMachine,
	type MouseState
} from '../state-machine.js';
import { Home as MouseHome } from './home.js';
import { Home as TouchScreenHome } from '@ts/interactivity/touchscreen/states/home.js';
import { Vec2 } from '@ts/math.js';
import { type Circuit } from '@ts/scene/objects/circuits/circuit.js';
import { logState } from '@lib/stores/debugging.js';
import { CreateCircuitUserAction } from '../../actions.js';

export class CreatingCircuit implements MouseState {
	constructor(
		private name: string,
		private creator: () => Circuit
	) {
		logState(`CreatingCircuit(${this.name})`);
	}

	update(mouseSM: MouseStateMachine, action: MouseAction) {
		const payload = action.payload;
		if (payload.target != canvas) {
			return;
		}
		const locScr = new Vec2(payload.offsetX, payload.offsetY);

		if (action.kind === MouseActionKind.MouseUp) {
			// const circuit = this.creator();
			const currentScene = sceneManager.getCurrentScene();
			if (currentScene.id == null) {
				throw Error();
			}

			// CircuitSceneObject.new(circuit, viewManager.screenToWorld(locScr), currentScene, ctx);
			actionsManager.do(
				new CreateCircuitUserAction(currentScene.id, this.name, this.creator, locScr)
			);

			console.log(`Created ${this.name}`);
			console.log('scene: ', sceneManager.getCurrentScene());
			mouseSM.state = new MouseHome();
			touchScreenStateMachine.state = new TouchScreenHome();
		}
	}
}
