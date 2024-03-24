import {
	type Circuit,
	CustomCircuit,
	InputCircuit,
	ProcessingCircuit
} from '@ts/scene/objects/circuit';
import { writable } from 'svelte/store';
import { sceneManager } from '@routes/+page.svelte';
import { Scene } from '@ts/scene/scene';
import { customCircuitsScenes } from './customCircuitsScenes';
import { domLog } from './debugging';

export let customCircuitCreator = (circuitName: string) => () => {
	let scene: Scene | undefined = new Scene();

	const unsubscribe = customCircuitsScenes.subscribe((circuits) => {
		const sceneId = circuits.get(circuitName);
		if (sceneId == null) {
			domLog(`[CircuitCreator][${circuitName}] sceneId == null`);
			throw Error();
		}

		scene = sceneManager.scenes.get(sceneId);
	});
	unsubscribe();
	if (scene == null) {
		throw Error();
	}

	if (scene.customCircuitInputs == null) {
		throw Error();
	}
	if (scene.customCircuitOutputs == null) {
		throw Error();
	}

	return new CustomCircuit(scene);
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
