import { actionsManager, sceneManager } from '@src/routes/dls/+page.svelte';
import { writable } from 'svelte/store';
import { HOME_SCENE_ID, HOME_SCENE_NAME } from '@ts/config';
import { type ID } from '@src/ts/scene/scene';
import { CreateICUserAction } from '@src/ts/interactivity/actions';

export const icNames = new Set<string>();

const { subscribe, update } = writable(
	new Map<number, string>([
		[HOME_SCENE_ID, HOME_SCENE_NAME]
		// ['a', 2],
		// ['b', 2],
		// ['c', 2],
		// ['d', 2],
		// ['e', 2],
		// ['f', 2],
		// ['g', 2],
		// ['abcdefghijklmnopqrstuvwxyz', 2],
		// ['i', 2],
		// ['j', 2],
		// ['k', 2],
		// ['l', 2],
		// ['n', 2],
		// ['o', 2],
		// ['p', 2],
		// ['q', 2],
		// ['s', 2]
	])
);
export const integratedCircuits = {
	subscribe,
	update,
	rename(id: ID, to: string) {
		const scene = sceneManager.scenes.get(id);
		if (scene == null) {
			throw Error();
		}
		const from = scene.name;
		scene.name = to;

		update((integratedCircuits) => {
			integratedCircuits.set(id, to);
			icNames.delete(from.toLowerCase());
			icNames.add(to.toLowerCase());

			console.log('[rename]: ', integratedCircuits);
			return integratedCircuits;
		});
	},
	getName(id: ID) {
		let name = '';
		const unsub = subscribe((value) => {
			const tmp = value.get(id);
			if (tmp == null) {
				throw Error();
			}
			name = tmp;
		});
		unsub();
		return name;
	},
	newIC(circuitName: string) {
		actionsManager.do(new CreateICUserAction());

		// const scene = Scene.newWithIO();
		// const sceneId = sceneManager.getNextSceneID();

		// sceneManager.registerSceneWithID(sceneId, scene);

		// // const scene = sceneManager.scenes.get(sceneId);
		// // if (scene == null) {
		// // 	throw Error();
		// // }
		// scene.name = circuitName;

		// icInstantiators.newInstantiator(circuitName, icInstanciator(circuitName));

		// update((circuits) => {
		// 	circuits.set(circuitName, sceneId);
		// 	return circuits;
		// });

		// sceneManager.setCurrentScene(sceneId);
	}
};
