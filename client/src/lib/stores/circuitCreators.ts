import { type Circuit } from '@ts/scene/objects/circuits/circuit';
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

let { subscribe, set, update } = writable(
	new Map([
		[
			'Input',
			() => {
				return new InputCircuit(false);
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
				return new ProcessingCircuit(2, 1, (self) => {
					self.producerPins[0].setValue(self.consumerPins[0].value && self.consumerPins[1].value);
				});
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
