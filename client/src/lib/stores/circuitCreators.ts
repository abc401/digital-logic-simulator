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
import { Scene } from '@ts/scene/scene';
import { customCircuits } from './customCircuits';
import { domLog } from './debugging';

// let customCircuitInstances = new Map<number, CustomCircuit[]>();

export let customCircuitCreator = (circuitName: string) => () => {
	let sceneId = customCircuits.getSceneIdFor(circuitName);
	if (sceneId == null) {
		throw Error();
	}

	let scene = sceneManager.scenes.get(sceneId);
	if (scene == null) {
		throw Error();
	}

	if (scene.customCircuitInputs == null) {
		throw Error();
	}
	if (scene.customCircuitOutputs == null) {
		throw Error();
	}

	let circuit = new CustomCircuit(scene);

	return circuit;
};

let { subscribe, set, update } = writable<Map<string, () => Circuit>>(
	new Map([
		[
			'Input',
			() => {
				return new InputCircuit(false) as Circuit;
			}
		],
		// [
		//   "CustomCircuitInputs",
		//   () => {
		//     return new CustomCircuitInputs();
		//   },
		// ],
		// [
		//   "CustomCircuitOutputs",
		//   () => {
		//     return new CustomCircuitOutputs();
		//   },
		// ],

		[
			'And',
			() => {
				return new ProcessingCircuit(
					2,
					1,
					(self) => {
						let value = true;
						for (let pin of self.consumerPins) {
							value = value && pin.value;
							if (!value) {
								break;
							}
						}
						self.producerPins[0].setValue(value);
					},
					{ Inputs: 2 },
					{ Inputs: CircuitPropType.NaturalNumber },
					function (circuit, name, value) {
						if (name != 'Inputs') {
							throw Error();
						}

						const num = +value;
						if (Number.isNaN(num) || !Number.isFinite(num) || num < 1) {
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
					}
				);
			}
		],
		[
			'Or',
			() => {
				return new ProcessingCircuit(2, 1, (self) => {
					self.producerPins[0].setValue(self.consumerPins[0].value || self.consumerPins[1].value);
				});
			}
		],
		[
			'Not',
			() => {
				return new ProcessingCircuit(1, 1, (self) => {
					self.producerPins[0].setValue(!self.consumerPins[0].value);
				});
			}
		],
		[
			'Nand',
			() => {
				return new ProcessingCircuit(2, 1, (self) => {
					self.producerPins[0].setValue(
						!(self.consumerPins[0].value && self.consumerPins[1].value)
					);
				});
			}
		],
		[
			'Nor',
			() => {
				return new ProcessingCircuit(2, 1, (self) => {
					self.producerPins[0].setValue(
						!(self.consumerPins[0].value || self.consumerPins[1].value)
					);
				});
			}
		]
	])
);

export let circuitCreators = {
	subscribe,
	newCustomCreator: function (name: string, creator: () => Circuit) {
		update((creators) => {
			creators.set(name, creator);
			return creators;
		});
	}
};
