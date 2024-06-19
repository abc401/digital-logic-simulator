import { writable } from 'svelte/store';
import { Scene } from '@ts/scene/scene';

const { subscribe, set } = writable<Scene | undefined>(undefined);
export const currentScene = {
	subscribe,
	init(scene: Scene) {
		set(scene);
	},
	get: function (): Scene | undefined {
		let scene: Scene | undefined = undefined;
		const unsub = subscribe((value) => {
			scene = value;
		});
		unsub();
		return scene;
	},
	setWithoutCommitting(scene: Scene) {
		set(scene);
	},
	set: function (scene: Scene) {
		const currentScene_ = this.get();
		if (scene === currentScene_) {
			return;
		}
		if (currentScene_ != null) {
			currentScene_.commitTmpObjects();
		}

		scene.reEvaluateICs();
		set(scene);
	}
};
