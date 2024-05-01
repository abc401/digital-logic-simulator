import { CircuitSceneObject, type Props } from '@src/ts/scene/objects/circuits/circuit';
// import { subscribe } from 'diagnostics_channel';
import { writable } from 'svelte/store';

const { subscribe: subscribeFocusedCircuit, set: setFocusedCircuit } = writable<
	CircuitSceneObject | undefined
>(undefined);

export const focusedCircuit = {
	subscribe: subscribeFocusedCircuit,
	set(circuit: CircuitSceneObject | undefined) {
		setFocusedCircuit(circuit);
		if (circuit == undefined) {
			circuitProps.set(undefined);
			return;
		}
		circuitProps.set(circuit.parentCircuit.props);
	},
	get() {
		let circuit: CircuitSceneObject | undefined = undefined;
		const unsubscribe = subscribeFocusedCircuit((value) => {
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

const {
	set: setCircuitProps,
	subscribe: subscribeCircuitProps,
	update: updateCircuitProps
} = writable<Props | undefined>(undefined);

export const circuitProps = {
	set: setCircuitProps,
	update: updateCircuitProps,
	subscribe: subscribeCircuitProps,
	refresh() {
		this.update((value) => {
			return value;
		});
		console.log('refreshed circuit props');
		// updateCircuitProps();
	}
};
