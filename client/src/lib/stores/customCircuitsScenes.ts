import { sceneManager } from '@routes/+page.svelte';
import { writable } from 'svelte/store';
import { circuitCreators, customCircuitCreator } from './circuitCreators';
import { SceneManager } from '@ts/scene/scene-manager';

let { subscribe, set, update } = writable(
	new Map<string, number>([[SceneManager.HOME_SCENE_NAME, SceneManager.HOME_SCENE_ID]])
);

export let customCircuitsScenes = {
	subscribe,
	newCircuit: function (circuitName: string) {
		const sceneId = sceneManager.newCustomScene();

		let scene = sceneManager.scenes.get(sceneId);
		if (scene == null) {
			throw Error();
		}
		scene.name = circuitName;

		circuitCreators.newCustomCreator(circuitName, customCircuitCreator(circuitName));

		update((circuits) => {
			circuits.set(circuitName, sceneId);
			return circuits;
		});

		sceneManager.setCurrentScene(sceneId);
	}
};
