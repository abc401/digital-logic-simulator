// import { clipboard, sceneManager } from '@ts/main';
import { sceneManager } from '@routes/+page.svelte';
import { type Circuit, cloneGraphAfterCircuit } from '@ts/scene/objects/circuits/circuit';
import { Wire } from '@ts/scene/objects/wire';

export let clipboard = {
	circuits: new Array<Circuit>(),
	wires: new Array<Wire>()
};

export function copySelectedToClipboard() {
	let clonedCircuits = new Array<Circuit>();
	let clonedWires = new Array<Wire>();

	let circuitCloneMapping = new Map<Circuit, Circuit>();
	let wireCloneMapping = new Map<Wire, Wire>();

	for (let circuit of sceneManager.selectedCircuits) {
		cloneGraphAfterCircuit(
			circuit.parentCircuit,
			clonedCircuits,
			clonedWires,
			circuitCloneMapping,
			wireCloneMapping
		);
	}

	// for (let circuit of clonedCircuits) {
	//   if (circuit.sceneObject == null) {
	//     throw Error();
	//   }
	//   circuit.sceneObject.isSelected = false;
	// }

	// for (let wire of clonedWires) {
	//   wire.isSelected = false;
	// }

	clipboard.circuits = clonedCircuits;
	clipboard.wires = clonedWires;
	console.log('Clipboard: ', clipboard);
}

export function pasteFromClipboard() {
	let clonedCircuits = new Array<Circuit>();
	let clonedWires = new Array<Wire>();

	let circuitCloneMapping = new Map<Circuit, Circuit>();
	let wireCloneMapping = new Map<Wire, Wire>();
	for (let circuit of clipboard.circuits) {
		cloneGraphAfterCircuit(
			circuit,
			clonedCircuits,
			clonedWires,
			circuitCloneMapping,
			wireCloneMapping
		);
	}

	sceneManager.clearSelectedCircuits();

	for (let wire of clonedWires) {
		wire.configSceneObject();
	}

	for (let circuit of clonedCircuits) {
		if (circuit.sceneObject == null) {
			throw Error();
		}

		circuit.configSceneObject(circuit.sceneObject.tightRectWrl.xy, undefined);
		sceneManager.selectCircuit(circuit.sceneObject);
	}
}
