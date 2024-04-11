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
import { integratedCircuits } from './integrated-circuits';

// let customCircuitInstances = new Map<number, CustomCircuit[]>();

export const icInstanciator = (icName: string) => () => {
	const sceneId = integratedCircuits.getSceneIdFor(icName);
	if (sceneId == null) {
		throw Error();
	}

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
			return new ProcessingCircuit(
				2,
				1,
				(self) => {
					self.producerPins[0].setValue(self.consumerPins[0].value || self.consumerPins[1].value);
				},
				'Or'
			);
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
		}
	},
	Edit: {
		Nand: () => {
			return new ProcessingCircuit(
				2,
				1,
				(self) => {
					self.producerPins[0].setValue(
						!(self.consumerPins[0].value && self.consumerPins[1].value)
					);
				},
				'Nand'
			);
		},
		Nor: () => {
			return new ProcessingCircuit(
				2,
				1,
				(self) => {
					self.producerPins[0].setValue(
						!(self.consumerPins[0].value || self.consumerPins[1].value)
					);
				},
				'Nor'
			);
		}
	}
};

const { subscribe, update } = writable<{ [key: string]: () => void }>({});
export const icInstanciators = {
	subscribe,
	newCustomCreator: function (name: string, creator: () => Circuit) {
		update((creators) => {
			creators[name] = creator;
			return creators;
		});
	}
};
