import { Scene } from '@ts/scene/scene';
import { writable } from 'svelte/store';

let { subscribe, set, update } = writable(new Scene());

export let currentScene = {
	subscribe,
	set
};
