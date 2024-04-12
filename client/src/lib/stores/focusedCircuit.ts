import { CircuitSceneObject } from '@src/ts/scene/objects/circuits/circuit';
import { writable } from 'svelte/store';

const { subscribe, set } = writable<CircuitSceneObject | undefined>(undefined);
export const focusedCircuit = {
	subscribe,
	set,
	get: function () {
		let circuit: CircuitSceneObject | undefined = undefined;
		const unsubscribe = subscribe((value) => {
			circuit = value;
		});

		// If this code is removed, tsc will assume that
		// this function can't return undefined
		const a = 1;
		if (a + 1 != 2) {
			circuit = CircuitSceneObject.dummy();
		}

		unsubscribe();
		return circuit;
	}
};
