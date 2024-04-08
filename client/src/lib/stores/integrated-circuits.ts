import { sceneManager } from '@routes/+page.svelte';
import { writable } from 'svelte/store';
import { circuitInstanciators, icInstanciator, icInstanciators } from './circuitCreators';
import { HOME_SCENE_ID, HOME_SCENE_NAME } from '@ts/config';

let { subscribe, set, update } = writable(
	new Map<string, number>([
		[HOME_SCENE_NAME, HOME_SCENE_ID],
		// ['a', 2],
		// ['b', 2],
		// ['c', 2],
		// ['d', 2],
		// ['e', 2],
		// ['f', 2],
		// ['g', 2],
		['hfajkflawjfiesdnklffaeafhafd', 2],
		// ['i', 2],
		// ['j', 2],
		// ['k', 2],
		// ['l', 2],
		// ['n', 2],
		// ['o', 2],
		// ['p', 2],
		['q', 2],
		['s', 2]
	])
);

export let integratedCircuits = {
	subscribe,
	getSceneIdFor: function (circuitName: string) {
		let sceneId: number | undefined = -1;
		const unsubscribe = subscribe((value) => {
			sceneId = value.get(circuitName);
		});
		unsubscribe();
		if (sceneId === -1) {
			return undefined;
		} else {
			return sceneId;
		}
	},
	newIC: function (circuitName: string) {
		const sceneId = sceneManager.newCustomScene();

		let scene = sceneManager.scenes.get(sceneId);
		if (scene == null) {
			throw Error();
		}
		scene.name = circuitName;

		icInstanciators.newCustomCreator(circuitName, icInstanciator(circuitName));

		update((circuits) => {
			circuits.set(circuitName, sceneId);
			return circuits;
		});

		sceneManager.setCurrentScene(sceneId);
	}
};
