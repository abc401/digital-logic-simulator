// import { clipboard, sceneManager } from '@ts/main';
import { sceneManager, viewManager } from '@routes/+page.svelte';
import {
	type Circuit,
	cloneGraphAfterCircuit,
	CircuitSceneObject
} from '@ts/scene/objects/circuits/circuit';
import { Wire } from '@ts/scene/objects/wire';
import type { UserAction } from './actions-manager';
import type { ID } from '../scene/scene';
import type { Vec2 } from '../math';

export const clipboard = {
	circuits: new Array<Circuit>(),
	wires: new Array<Wire>()
};

export function copySelectedToClipboard() {
	const clonedCircuits = new Array<Circuit>();
	const clonedWires = new Array<Wire>();

	const circuitCloneMapping = new Map<Circuit, Circuit>();
	const wireCloneMapping = new Map<Wire, Wire>();

	for (const circuit of sceneManager.selectedCircuits) {
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
	const clonedCircuits = new Array<Circuit>();
	const clonedWires = new Array<Wire>();

	const circuitCloneMapping = new Map<Circuit, Circuit>();
	const wireCloneMapping = new Map<Wire, Wire>();
	for (const circuit of clipboard.circuits) {
		cloneGraphAfterCircuit(
			circuit,
			clonedCircuits,
			clonedWires,
			circuitCloneMapping,
			wireCloneMapping
		);
	}

	sceneManager.clearSelectedCircuits();

	for (const wire of clonedWires) {
		wire.configSceneObject();
	}

	for (const circuit of clonedCircuits) {
		if (circuit.sceneObject == null) {
			throw Error();
		}

		circuit.configSceneObject(circuit.sceneObject.tightRectWrl.xy, undefined);
		sceneManager.selectCircuit(circuit.sceneObject.id as ID);
	}
}

export function dragSelection(delta: Vec2) {
	for (const circuit of sceneManager.selectedCircuits) {
		circuit.setPos(circuit.tightRectWrl.xy.add(delta));
	}
}

export class DragUserAction implements UserAction {
	name = 'Drag';
	constructor(private delta: Vec2) {
		// console.log('Drag Action Created');
	}

	do(): void {
		dragSelection(this.delta);
		// console.log('Drag Action Do');
	}
	undo(): void {
		dragSelection(this.delta.neg());
		// console.log('Drag Action Undo');
	}
}

export class PanUserAction implements UserAction {
	constructor(private delta: Vec2) {}
	name = 'Pan';

	do(): void {
		viewManager.pan(this.delta);
	}
	undo(): void {
		viewManager.pan(this.delta.neg());
	}
}

export class ZoomUserAction implements UserAction {
	constructor(
		readonly zoomOriginScr: Vec2,
		readonly zoomLevelDelta: number
	) {}

	name = 'Zoom';

	do(): void {
		viewManager.zoom(this.zoomOriginScr, viewManager.zoomLevel + this.zoomLevelDelta);
	}
	undo(): void {
		viewManager.zoom(this.zoomOriginScr, viewManager.zoomLevel - this.zoomLevelDelta);
	}
}
