import {
	CircuitPropType,
	type Circuit,
	setConsumerPinNumber
} from '@ts/scene/objects/circuits/circuit';
import { CustomCircuit } from '@ts/scene/objects/circuits/custom-circuit';
import { ProcessingCircuit } from '@ts/scene/objects/circuits/processing-circuit';
import { InputCircuit } from '@ts/scene/objects/circuits/input-circuit';
import { writable } from 'svelte/store';
import { sceneManager } from '@routes/+page.svelte';
import type { ID } from '@src/ts/scene/scene';

// let customCircuitInstances = new Map<number, CustomCircuit[]>();

export const icInstanciator = (sceneId: ID) => () => {
	const scene = sceneManager.scenes.get(sceneId);
	if (scene == null) {
		throw Error();
	}

	if (scene.customCircuitInputs == null) {
		throw Error();
	}
	if (scene.customCircuitOutputs == null) {
		throw Error();
	}

	const circuit = new CustomCircuit(scene);

	return circuit;
};

export const circuitInstanciators: { [key: string]: { [key: string]: () => Circuit } } = {
	Add: {
		Input: () => {
			return new InputCircuit(false) as Circuit;
		},
		And: () => {
			const circuit = new ProcessingCircuit(
				2,
				1,
				(self) => {
					let value = true;
					for (const pin of self.consumerPins) {
						value = value && pin.value;
						if (!value) {
							break;
						}
					}
					self.producerPins[0].setValue(value);
				},
				'And'
			);
			circuit.newProp('Inputs', CircuitPropType.NaturalNumber, 2, function (circuit, value) {
				const num = +value;
				if (Number.isNaN(num) || !Number.isFinite(num) || num % 1 !== 0 || num < 1) {
					console.log('Hello1');
					return false;
				}
				if (!setConsumerPinNumber(circuit, num)) {
					console.log('Hello2');
					return false;
				}
				circuit.props.Inputs = num;
				if (circuit.sceneObject != null) {
					circuit.sceneObject.calcRects();
				}
				return true;
			});
			return circuit;
		},
		Or: () => {
			const circuit = new ProcessingCircuit(
				2,
				1,
				(self) => {
					let value = false;
					for (const pin of self.consumerPins) {
						value = value || pin.value;
						if (value) {
							break;
						}
					}
					self.producerPins[0].setValue(value);
				},
				'Or'
			);
			circuit.newProp('Inputs', CircuitPropType.NaturalNumber, 2, function (circuit, value) {
				const num = +value;
				if (Number.isNaN(num) || !Number.isFinite(num) || num % 1 !== 0 || num < 1) {
					console.log('Hello1');
					return false;
				}
				if (!setConsumerPinNumber(circuit, num)) {
					console.log('Hello2');
					return false;
				}
				circuit.props.Inputs = num;
				if (circuit.sceneObject != null) {
					circuit.sceneObject.calcRects();
				}
				return true;
			});
			return circuit;
		},
		Not: () => {
			return new ProcessingCircuit(
				1,
				1,
				(self) => {
					self.producerPins[0].setValue(!self.consumerPins[0].value);
				},
				'Not'
			);
		},
		Nand: () => {
			const circuit = new ProcessingCircuit(
				2,
				1,
				(self) => {
					let value = true;
					for (const pin of self.consumerPins) {
						value = value && pin.value;
						if (!value) {
							break;
						}
					}
					self.producerPins[0].setValue(!value);
				},
				'Nand'
			);
			circuit.newProp('Inputs', CircuitPropType.NaturalNumber, 2, function (circuit, value) {
				const num = +value;
				if (Number.isNaN(num) || !Number.isFinite(num) || num % 1 !== 0 || num < 1) {
					console.log('Hello1');
					return false;
				}
				if (!setConsumerPinNumber(circuit, num)) {
					console.log('Hello2');
					return false;
				}
				circuit.props.Inputs = num;
				if (circuit.sceneObject != null) {
					circuit.sceneObject.calcRects();
				}
				return true;
			});
			return circuit;
		},
		Nor: () => {
			const circuit = new ProcessingCircuit(
				2,
				1,
				(self) => {
					let value = false;
					for (const pin of self.consumerPins) {
						value = value || pin.value;
						if (value) {
							break;
						}
					}
					self.producerPins[0].setValue(!value);
				},
				'Nor'
			);
			circuit.newProp('Inputs', CircuitPropType.NaturalNumber, 2, function (circuit, value) {
				const num = +value;
				if (Number.isNaN(num) || !Number.isFinite(num) || num % 1 !== 0 || num < 1) {
					console.log('Hello1');
					return false;
				}
				if (!setConsumerPinNumber(circuit, num)) {
					console.log('Hello2');
					return false;
				}
				circuit.props.Inputs = num;
				if (circuit.sceneObject != null) {
					circuit.sceneObject.calcRects();
				}
				return true;
			});
			return circuit;
		}
	}
};

const { subscribe, update } = writable<{ [key: ID]: () => Circuit }>({});
export const icInstantiators = {
	subscribe,
	removeInstantiator: function (id: ID) {
		update((instantiators) => {
			delete instantiators[id];
			return instantiators;
		});
	},
	newInstantiator: function (id: ID, instantiator: () => Circuit) {
		update((instantiators) => {
			instantiators[id] = instantiator;
			return instantiators;
		});
	}
};
