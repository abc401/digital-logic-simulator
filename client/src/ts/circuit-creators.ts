// import { customCircuitScenes, sceneManager } from './main.js';
// import { customCircuitScenes, domLog, sceneManager } from '@routes/+page.svelte';
// import {
// 	type Circuit,
// 	CustomCircuit,
// 	InputCircuit,
// 	ProcessingCircuit
// } from './scene/objects/circuit';
// export let customCircuitCreator = (circuitName: string) => () => {
// 	const sceneId = customCircuitScenes.get(circuitName);
// 	if (sceneId == null) {
// 		domLog(`[CircuitCreator][${circuitName}] sceneId == null`);
// 		throw Error();
// 	}
// 	const scene = sceneManager.scenes.get(sceneId);
// 	if (scene == null) {
// 		throw Error();
// 	}

// 	if (scene.customCircuitInputs == null) {
// 		throw Error();
// 	}
// 	if (scene.customCircuitOutputs == null) {
// 		throw Error();
// 	}

// 	return new CustomCircuit(scene);
// };

// export let creators: Map<string, () => Circuit> = new Map([
// 	[
// 		'Input',
// 		() => {
// 			return new InputCircuit(false);
// 		}
// 	],
// 	// [
// 	//   "CustomCircuitInputs",
// 	//   () => {
// 	//     return new CustomCircuitInputs();
// 	//   },
// 	// ],
// 	// [
// 	//   "CustomCircuitOutputs",
// 	//   () => {
// 	//     return new CustomCircuitOutputs();
// 	//   },
// 	// ],

// 	[
// 		'And',
// 		() => {
// 			return new ProcessingCircuit(2, 1, (self) => {
// 				self.producerPins[0].setValue(self.consumerPins[0].value && self.consumerPins[1].value);
// 			});
// 		}
// 	],
// 	[
// 		'Or',
// 		() => {
// 			return new ProcessingCircuit(2, 1, (self) => {
// 				self.producerPins[0].setValue(self.consumerPins[0].value || self.consumerPins[1].value);
// 			});
// 		}
// 	],
// 	[
// 		'Not',
// 		() => {
// 			return new ProcessingCircuit(1, 1, (self) => {
// 				self.producerPins[0].setValue(!self.consumerPins[0].value);
// 			});
// 		}
// 	],
// 	[
// 		'Nand',
// 		() => {
// 			return new ProcessingCircuit(2, 1, (self) => {
// 				self.producerPins[0].setValue(!(self.consumerPins[0].value && self.consumerPins[1].value));
// 			});
// 		}
// 	],
// 	[
// 		'Nor',
// 		() => {
// 			return new ProcessingCircuit(2, 1, (self) => {
// 				self.producerPins[0].setValue(!(self.consumerPins[0].value || self.consumerPins[1].value));
// 			});
// 		}
// 	]
// ]);
