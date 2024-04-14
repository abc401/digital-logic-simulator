import { actionsManager, sceneManager } from '@routes/+page.svelte';
import { writable } from 'svelte/store';
import { icInstanciator, icInstantiators } from './circuitCreators';
import { HOME_SCENE_ID, HOME_SCENE_NAME } from '@ts/config';
import { Scene, type ID } from '@src/ts/scene/scene';
import type { UserAction } from '@src/ts/interactivity/actions-manager';

export class CreateICUserAction implements UserAction {
	name = '';

	static nextICNumber = 0;

	currentICNumber: number;

	private scene: Scene | undefined;
	private sceneID: number;
	constructor() {
		this.sceneID = sceneManager.getNextSceneID();
		this.currentICNumber = CreateICUserAction.nextICNumber;
		CreateICUserAction.nextICNumber += 1;
	}

	do(): void {
		this.scene = Scene.newWithIO();

		if (this.currentICNumber === 0) {
			this.scene.name = 'New Circuit';
		} else {
			this.scene.name = `New Circuit (${this.currentICNumber})`;
		}

		sceneManager.registerSceneWithID(this.sceneID, this.scene);
		icNames.add(this.scene.name.toLowerCase());

		icInstantiators.newInstantiator(this.sceneID, icInstanciator(this.sceneID));

		update((circuits) => {
			if (this.scene == null) {
				throw Error();
			}

			circuits.set(this.sceneID, this.scene.name);
			return circuits;
		});
	}
	undo(): void {
		sceneManager.unregisterScene(this.sceneID);
		update((circuits) => {
			if (this.scene == null) {
				throw Error();
			}
			icNames.delete(this.scene.name.toLowerCase());

			circuits.delete(this.sceneID);
			return circuits;
		});

		icInstantiators.removeInstantiator(this.sceneID);
	}
}

export class RenameICUserAction implements UserAction {
	name = '';

	from: string;
	constructor(
		private id: ID,
		private to: string
	) {
		const scene = sceneManager.scenes.get(id);
		if (scene == null) {
			throw Error();
		}
		this.from = scene.name;
	}

	do(): void {
		integratedCircuits.rename(this.id, this.to);
	}
	undo(): void {
		integratedCircuits.rename(this.id, this.from);
	}
}

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
	rename(id: ID, to: string) {
		let from = '';
		const unsub = subscribe((value) => {
			const scene = sceneManager.scenes.get(id);
			if (scene == null) {
				throw Error();
			}
			from = scene.name;
		});
		unsub();

		update((integratedCircuits) => {
			integratedCircuits.set(id, to);
			icNames.delete(from.toLowerCase());
			icNames.add(to.toLowerCase());

			console.log('[rename]: ', integratedCircuits);
			return integratedCircuits;
		});
	},
	// getSceneIdFor(circuitName: string) {
	// 	let sceneId: number | undefined = -1;
	// 	const unsubscribe = subscribe((value) => {
	// 		sceneId = value.get(circuitName);
	// 	});
	// 	unsubscribe();
	// 	if (sceneId === -1) {
	// 		return undefined;
	// 	} else {
	// 		return sceneId;
	// 	}
	// },
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
