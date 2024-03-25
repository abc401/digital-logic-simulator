import { sceneManager, touchScreenStateMachine, viewManager } from '@routes/+page.svelte';
import {
	MouseAction,
	MouseActionKind,
	MouseStateMachine,
	type MouseState
} from '../state-machine.js';
import { Home as MouseHome } from './home.js';
import { Home as TouchScreenHome } from '@ts/interactivity/touchscreen/states/home.js';
import { Vec2 } from '@ts/math.js';
import type { Circuit } from '@ts/scene/objects/circuit.js';
import { logState } from '@lib/stores/debugging.js';
import { SceneManager } from '@ts/scene/scene-manager.js';
import { HOME_SCENE_NAME } from '@ts/config.js';

export class CreatingCircuit implements MouseState {
	constructor(
		private name: string,
		private creator: () => Circuit
	) {
		logState(`CreatingCircuit(${this.name})`);
	}

	update(stateMachine: MouseStateMachine, action: MouseAction) {
		const payload = action.payload;
		const locScr = new Vec2(payload.offsetX, payload.offsetY);

		if (action.kind === MouseActionKind.MouseUp) {
			let circuit = this.creator();
			const currentScene = sceneManager.getCurrentScene();
			circuit.configSceneObject(viewManager.screenToWorld(locScr), currentScene);

			console.log(`Created ${this.name}`);
			console.log('scene: ', sceneManager.getCurrentScene());
			stateMachine.state = new MouseHome();
			touchScreenStateMachine.state = new TouchScreenHome();
		}
	}
}
