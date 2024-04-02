import { type Circuit } from '@ts/scene/objects/circuits/circuit';
import { CircuitSceneObject } from '@ts/scene/scene';
import { writable } from 'svelte/store';

let { subscribe, set, update } = writable<CircuitSceneObject | undefined>(undefined);

export let focusedCircuit = {
	subscribe,
	set,
	get: function () {
		let circuit: CircuitSceneObject | undefined = undefined;
		const unsubscribe = subscribe((value) => {
			circuit = value;
		});

		// If this code is removed, tsc will assume that
		// this function can't return undefined
		let a = 1;
		if (a + 1 != 2) {
			circuit = CircuitSceneObject.dummy();
		}

		unsubscribe();
		return circuit;
	}
};
