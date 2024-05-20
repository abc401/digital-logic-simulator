// import { clipboard, sceneManager } from '@ts/main';
import { actionsManager, ctx, sceneManager, view } from '@routes/+page.svelte';
import {
	type Circuit,
	cloneGraphAfterCircuit,
	CircuitSceneObject,
	getPropSetter
} from '@ts/scene/objects/circuits/circuit';
import { Wire } from '@ts/scene/objects/wire';
import type { UserAction } from './actions-manager';
import { Scene, currentScene, type ID } from '../scene/scene';
import type { Vec2 } from '../math';
import { circuitProps, focusedCircuit } from '@src/lib/stores/focusedCircuit';
import { domLog } from '@src/lib/stores/debugging';
import { icNames } from '@src/lib/stores/integrated-circuits';
import { icInstantiators, icInstanciator } from '@src/lib/stores/circuitInstantiators';
import { integratedCircuits } from '@src/lib/stores/integrated-circuits';
import type { View } from '../view-manager';
import { actionURL } from '../api';

export const DUMMY_HOSTNAME = 'this-url-should-not-be-fetched';
const DUMMY_URL = new URL(`http://${DUMMY_HOSTNAME}/`);

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

	sceneManager.deselectAll();

	const currentScene_ = currentScene.get();

	for (const wire of clonedWires) {
		// wire.configSceneObject();
		wire.register(currentScene_);
	}

	for (const circuit of clonedCircuits) {
		if (circuit.sceneObject == null) {
			throw Error();
		}

		CircuitSceneObject.new(circuit, circuit.sceneObject.tightRectWrl.xy, currentScene_, ctx);
		// circuit.configSceneObject(circuit.sceneObject.tightRectWrl.xy, undefined);
		sceneManager.selectCircuit(circuit.sceneObject.id as ID);
	}
}

export function dragSelection(delta: Vec2) {
	for (const circuit of sceneManager.selectedCircuits) {
		circuit.setPos(circuit.tightRectWrl.xy.add(delta));
	}
}

export class NoopUserAction implements UserAction {
	name = 'Noop';
	do(): void {}
	undo(): void {}

	getDoURL(): URL {
		return DUMMY_URL;
	}
	getUndoURL(): URL {
		return DUMMY_URL;
	}
}

// Api implemented
export class DragUserAction implements UserAction {
	name = 'Drag';
	constructor(private deltaWrl: Vec2) {
		// console.log('Drag Action Created');
	}

	do(): void {
		dragSelection(this.deltaWrl);
		// console.log('Drag Action Do');
	}
	undo(): void {
		dragSelection(this.deltaWrl.neg());
		// console.log('Drag Action Undo');
	}
	getDoURL(): URL {
		return DUMMY_URL;
	}
	getUndoURL(): URL {
		return DUMMY_URL;
	}
}

// Api implemented
export class PanUserAction implements UserAction {
	constructor(private deltaScr: Vec2) {}
	name = 'Pan';

	do(): void {
		view.pan(this.deltaScr);
	}
	undo(): void {
		view.pan(this.deltaScr.neg());
	}
	getDoURL(): URL {
		// return DUMMY_URL;
		return actionURL('/pan/do');
	}
	getUndoURL(): URL {
		// return DUMMY_URL;
		return actionURL('/pan/undo');
	}
}

// Api implemented
export class ZoomUserAction implements UserAction {
	constructor(
		readonly zoomOriginScr: Vec2,
		public zoomLevelDelta: number
	) {}

	name = 'Zoom';

	do(): void {
		view.zoom(this.zoomOriginScr, view.zoomLevel + this.zoomLevelDelta);
	}
	undo(): void {
		view.zoom(this.zoomOriginScr, view.zoomLevel - this.zoomLevelDelta);
	}
	getDoURL(): URL {
		return actionURL('/mouse-zoom/do');
	}
	getUndoURL(): URL {
		return actionURL('/mouse-zoom/undo');
	}
}
export class TouchScreenZoomUserAction implements UserAction {
	name = '';
	constructor(
		readonly startingView: View,
		readonly endingView: View
	) {}

	do(): void {
		view.setView(this.endingView);
	}
	undo(): void {
		view.setView(this.startingView);
	}
	getDoURL(): URL {
		return actionURL('/touch-screen-zoom/do');
	}
	getUndoURL(): URL {
		return actionURL('/touch-screen-zoom/undo');
	}
}

export class CreateCircuitUserAction implements UserAction {
	name = 'CreateCircuitUserAction';
	private readonly circuitID: ID;
	constructor(
		private targetSceneID: ID,
		private instantiator: () => Circuit,
		private locScr: Vec2
	) {
		const targetScene = sceneManager.scenes.get(this.targetSceneID);
		if (targetScene == null) {
			throw Error();
		}
		this.circuitID = targetScene.getNextID();
	}

	do(): void {
		console.log('CreateCircuitUserAction.do');
		const targetScene = sceneManager.scenes.get(this.targetSceneID);
		if (targetScene == null) {
			throw Error();
		}
		const circuit = this.instantiator();
		const currentScene = sceneManager.getCurrentScene();

		CircuitSceneObject.newWithID(
			this.circuitID,
			circuit,
			view.screenToWorld(this.locScr),
			currentScene,
			ctx
		);
	}
	undo(): void {
		console.log('CreateCircuitUserAction.undo');
		const targetScene = sceneManager.scenes.get(this.targetSceneID);
		if (targetScene == null) {
			throw Error();
		}
		targetScene.unregisterCircuit(this.circuitID);
		console.log('TargetScene: ', targetScene);
	}
	getDoURL(): URL {
		return DUMMY_URL;
	}
	getUndoURL(): URL {
		return DUMMY_URL;
	}
}

export class DeleteWireUserAction implements UserAction {
	name = 'DeleteWireUserAction';

	wireID: ID;

	producerCircuitID: ID;
	producerPinIdx: number;

	consumerCircuitID: ID;
	consumerPinIdx: number;

	constructor(
		wire: Wire,
		private sceneID: ID
	) {
		const targetScene = sceneManager.scenes.get(sceneID);
		if (targetScene == null) {
			throw Error();
		}
		if (wire.id == null) {
			throw Error();
		}

		this.wireID = wire.id;

		if (
			wire.consumerPin == null ||
			wire.consumerPin.parentCircuit.sceneObject == null ||
			wire.consumerPin.parentCircuit.sceneObject.id == null ||
			wire.producerPin == null ||
			wire.producerPin.parentCircuit.sceneObject == null ||
			wire.producerPin.parentCircuit.sceneObject.id == null
		) {
			throw Error();
		}

		this.producerCircuitID = wire.producerPin.parentCircuit.sceneObject.id;
		this.producerPinIdx = wire.producerPin.pinIndex;
		this.consumerCircuitID = wire.consumerPin.parentCircuit.sceneObject.id;
		this.consumerPinIdx = wire.consumerPin.pinIndex;
	}
	do(): void {
		const targetScene = sceneManager.scenes.get(this.sceneID);
		if (targetScene == null) {
			throw Error();
		}
		const wire = targetScene.idToWire.get(this.wireID);
		if (wire == null) {
			throw Error();
		}
		targetScene.unregisterWire(this.wireID);
		wire.detach();
	}
	undo(): void {
		const targetScene = sceneManager.scenes.get(this.sceneID);
		if (targetScene == null) {
			throw Error();
		}

		const producerCircuit = targetScene.idToCircuit.get(this.producerCircuitID);
		const consumerCircuit = targetScene.idToCircuit.get(this.consumerCircuitID);
		if (producerCircuit == null || consumerCircuit == null) {
			throw Error();
		}

		const wire = Wire.newUnregistered(
			producerCircuit.parentCircuit.producerPins[this.producerPinIdx],
			consumerCircuit.parentCircuit.consumerPins[this.consumerPinIdx]
		);

		wire.registerWithID(this.wireID, targetScene);
	}
	getDoURL(): URL {
		return DUMMY_URL;
	}
	getUndoURL(): URL {
		return DUMMY_URL;
	}
}

export class CreateWireUserAction implements UserAction {
	name = 'CreateWireUserAction';
	wireID: ID;

	producerCircuitID: ID;
	producerPinIdx: number;

	consumerCircuitID: ID;
	consumerPinIdx: number;

	constructor(
		private sceneID: ID,
		wire: Wire
	) {
		const targetScene = sceneManager.scenes.get(sceneID);
		if (targetScene == null) {
			throw Error();
		}
		this.wireID = targetScene.getNextID();
		if (
			wire.consumerPin == null ||
			wire.consumerPin.parentCircuit.sceneObject == null ||
			wire.consumerPin.parentCircuit.sceneObject.id == null ||
			wire.producerPin == null ||
			wire.producerPin.parentCircuit.sceneObject == null ||
			wire.producerPin.parentCircuit.sceneObject.id == null
		) {
			throw Error();
		}

		this.producerCircuitID = wire.producerPin.parentCircuit.sceneObject.id;
		this.producerPinIdx = wire.producerPin.pinIndex;
		this.consumerCircuitID = wire.consumerPin.parentCircuit.sceneObject.id;
		this.consumerPinIdx = wire.consumerPin.pinIndex;
	}

	do(): void {
		const targetScene = sceneManager.scenes.get(this.sceneID);
		if (targetScene == null) {
			throw Error();
		}

		const producerCircuit = targetScene.idToCircuit.get(this.producerCircuitID);
		const consumerCircuit = targetScene.idToCircuit.get(this.consumerCircuitID);
		if (producerCircuit == null || consumerCircuit == null) {
			throw Error();
		}

		const wire = Wire.newUnregistered(
			producerCircuit.parentCircuit.producerPins[this.producerPinIdx],
			consumerCircuit.parentCircuit.consumerPins[this.consumerPinIdx]
		);

		wire.registerWithID(this.wireID, targetScene);
		console.log('[CreatingWireUserAction.do] wire: ', wire);
	}
	undo(): void {
		const targetScene = sceneManager.scenes.get(this.sceneID);
		if (targetScene == null) {
			throw Error();
		}
		const wire = targetScene.idToWire.get(this.wireID);
		if (wire == null) {
			throw Error();
		}
		targetScene.unregisterWire(this.wireID);
		wire.detach();
	}
	getDoURL(): URL {
		return DUMMY_URL;
	}
	getUndoURL(): URL {
		return DUMMY_URL;
	}
}

export class SetCircuitPropUserAction implements UserAction {
	name = 'SetCircuitPropUserAction';

	constructor(
		private sceneID: ID,
		private circuitID: ID,
		private propName: string,
		private valueToSet: any,
		private currentValue: any
	) {
		const scene = sceneManager.scenes.get(sceneID);
		if (scene == null) {
			throw Error();
		}
		const circuit = scene.idToCircuit.get(circuitID);
		if (circuit == null) {
			throw Error();
		}
	}
	do(): void {
		const scene = sceneManager.scenes.get(this.sceneID);
		if (scene == null) {
			throw Error();
		}
		const circuit = scene.idToCircuit.get(this.circuitID);
		if (circuit == null) {
			throw Error();
		}

		const propSetter = getPropSetter(circuit.parentCircuit, this.propName);
		propSetter(circuit.parentCircuit, this.valueToSet);
		circuitProps.refresh();
	}

	undo(): void {
		const scene = sceneManager.scenes.get(this.sceneID);
		if (scene == null) {
			throw Error();
		}
		const circuit = scene.idToCircuit.get(this.circuitID);
		if (circuit == null) {
			throw Error();
		}

		const propSetter = getPropSetter(circuit.parentCircuit, this.propName);
		propSetter(circuit.parentCircuit, this.currentValue);

		circuitProps.refresh();
	}
	getDoURL(): URL {
		return DUMMY_URL;
	}
	getUndoURL(): URL {
		return DUMMY_URL;
	}
}

export class SelectCircuitUserAction implements UserAction {
	name = 'SelectCircuitUserAction';
	private sceneID: ID;
	constructor(private circuitID: ID) {
		const sceneID = currentScene.get().id;
		if (sceneID == null) {
			throw Error();
		}
		this.sceneID = sceneID;

		const scene = sceneManager.scenes.get(this.sceneID);
		if (scene == null) {
			throw Error();
		}
		if (scene.idToCircuit.get(this.circuitID) == null) {
			throw Error();
		}
	}
	do(): void {
		if (currentScene.get().id != this.sceneID) {
			throw Error();
		}
		sceneManager.selectCircuit(this.circuitID);
	}
	undo(): void {
		if (currentScene.get().id != this.sceneID) {
			throw Error();
		}
		sceneManager.deselectCircuit(this.circuitID);
	}
	getDoURL(): URL {
		return actionURL('/select-circuit/do');
	}
	getUndoURL(): URL {
		return actionURL('/select-circuit/undo');
	}
}

export class DeselectCircuitUserAction implements UserAction {
	name = 'DeselectCircuitUserAction';
	private sceneID: ID;
	constructor(private circuitID: ID) {
		const sceneID = currentScene.get().id;
		if (sceneID == null) {
			throw Error();
		}
		this.sceneID = sceneID;

		const scene = sceneManager.scenes.get(this.sceneID);
		if (scene == null) {
			throw Error();
		}
		if (scene.idToCircuit.get(this.circuitID) == null) {
			throw Error();
		}
	}
	do(): void {
		if (currentScene.get().id != this.sceneID) {
			throw Error();
		}
		sceneManager.deselectCircuit(this.circuitID);
	}
	undo(): void {
		if (currentScene.get().id != this.sceneID) {
			throw Error();
		}
		sceneManager.selectCircuit(this.circuitID);
	}
	getDoURL() {
		return actionURL('/deselect-circuit/do');
	}
	getUndoURL(): URL {
		return actionURL('/deselect-circuit/undo');
	}
}
export class SwitchSceneUserAction implements UserAction {
	name = 'SwitchSceneUserAction';
	private fromSceneID: ID;

	private selectedCircuits = new Array<ID>();
	private selectedWires = new Array<ID>();

	constructor(private toSceneID: ID) {
		const currentScene_ = currentScene.get();
		if (currentScene_.id == null) {
			throw Error();
		}
		this.fromSceneID = currentScene_.id;
		for (const circuit of sceneManager.selectedCircuits) {
			if (circuit.id == null) {
				throw Error();
			}
			this.selectedCircuits.push(circuit.id as ID);
		}
		for (const wire of sceneManager.selectedWires) {
			if (wire.id == null) {
				console.error('Wire without id: ', wire);
				throw Error();
			}
			this.selectedWires.push(wire.id as ID);
		}
	}

	do(): void {
		const toScene = sceneManager.scenes.get(this.toSceneID);
		if (toScene == null) {
			domLog('[SceneManager.setCurrentScene] Provided sceneId is invalid.');
			throw Error();
		}

		console.log('SwitchSceneUserAction.do');
		toScene.refreshICLabels();
		// for (const [, { instances }] of toScene.customCircuitInstances) {
		// 	for (const ic of instances) {
		// 		ic.refreshLabel();
		// 	}
		// }
		currentScene.set(toScene);
		sceneManager.deselectAll();
		// sceneManager.selectedCircuits = new Set();
		// sceneManager.selectedWires = new Set();
	}

	undo(): void {
		const fromScene = sceneManager.scenes.get(this.fromSceneID);
		if (fromScene == null) {
			domLog('[SceneManager.setCurrentScene] Provided sceneId is invalid.');
			throw Error();
		}

		console.log('SwitchSceneUserAction.undo');
		fromScene.refreshICLabels();

		// for (const [, { instances }] of fromScene.customCircuitInstances) {
		// 	for (const ic of instances) {
		// 		ic.refreshLabel();
		// 	}
		// }
		currentScene.set(fromScene);

		// sceneManager.selectedCircuits = new Set();
		sceneManager.deselectAllCircuits();
		const scene = sceneManager.scenes.get(this.fromSceneID);
		if (scene == null) {
			throw Error();
		}
		for (const circuitID of this.selectedCircuits) {
			sceneManager.selectCircuitUnchecked(circuitID);
		}

		if (this.selectedCircuits.length != 1) {
			focusedCircuit.set(undefined);
		} else {
			const circuitID = this.selectedCircuits[0];
			const circuit = scene.idToCircuit.get(circuitID);
			if (circuit == null) {
				throw Error();
			}

			focusedCircuit.set(circuit);
		}

		sceneManager.selectedWires = new Set();
		for (const wireID of this.selectedWires) {
			const wire = scene.idToWire.get(wireID);
			if (wire == null) {
				throw Error();
			}
			sceneManager.selectWireUnchecked(wire);
			// sceneManager.selectedWires.add(wire);
		}
	}
	getDoURL(): URL {
		return DUMMY_URL;
	}
	getUndoURL(): URL {
		return DUMMY_URL;
	}
}
export class CreateICUserAction implements UserAction {
	name = 'CreateICUserAction';

	static nextICNumber = 0;

	currentICNumber: number;

	private scene: Scene | undefined;
	private sceneID: number;
	constructor() {
		this.sceneID = sceneManager.getNextSceneID();
		this.currentICNumber = CreateICUserAction.nextICNumber;
		CreateICUserAction.nextICNumber += 1;
	}

	do(): void {
		this.scene = Scene.newWithIO();

		if (this.currentICNumber === 0) {
			this.scene.name = 'New Circuit';
		} else {
			this.scene.name = `New Circuit (${this.currentICNumber})`;
		}

		sceneManager.registerSceneWithID(this.sceneID, this.scene);
		icNames.add(this.scene.name.toLowerCase());

		icInstantiators.newInstantiator(this.sceneID, icInstanciator(this.sceneID));

		// integratedCircuits.newIC()
		integratedCircuits.update((circuits) => {
			if (this.scene == null) {
				throw Error();
			}

			circuits.set(this.sceneID, this.scene.name);
			return circuits;
		});
	}
	undo(): void {
		sceneManager.unregisterScene(this.sceneID);
		integratedCircuits.update((circuits) => {
			if (this.scene == null) {
				throw Error();
			}
			icNames.delete(this.scene.name.toLowerCase());

			circuits.delete(this.sceneID);
			return circuits;
		});

		icInstantiators.removeInstantiator(this.sceneID);
	}
	getDoURL(): URL {
		return DUMMY_URL;
	}
	getUndoURL(): URL {
		return DUMMY_URL;
	}
}
export class RenameICUserAction implements UserAction {
	name = 'RenameICUserAction';

	from: string;
	constructor(
		private id: ID,
		private to: string
	) {
		const scene = sceneManager.scenes.get(id);
		if (scene == null) {
			throw Error();
		}
		this.from = scene.name;
	}

	do(): void {
		integratedCircuits.rename(this.id, this.to);
		currentScene.get().refreshICLabels();
	}
	undo(): void {
		integratedCircuits.rename(this.id, this.from);
		currentScene.get().refreshICLabels();
	}
	getDoURL(): URL {
		return DUMMY_URL;
	}
	getUndoURL(): URL {
		return DUMMY_URL;
	}
}

export class DeselectAllUserAction implements UserAction {
	name = 'DeselectAllUserAction';

	private currentSceneID: ID;
	private selectedWireIDs = new Array<ID>();
	private selectedCircuitIDs = new Array<ID>();

	constructor() {
		const currentSceneID = currentScene.get().id;
		if (currentSceneID == null) {
			throw Error();
		}
		this.currentSceneID = currentSceneID;

		for (const circuit of sceneManager.selectedCircuits) {
			if (circuit.id == null) {
				throw Error();
			}
			this.selectedCircuitIDs.push(circuit.id);
		}
		for (const wire of sceneManager.selectedWires) {
			if (wire.id == null) {
				throw Error();
			}
			this.selectedWireIDs.push(wire.id);
		}
	}
	do(): void {
		if (currentScene.get().id != this.currentSceneID) {
			throw Error();
		}
		sceneManager.deselectAll();
	}
	undo(): void {
		const currentScene_ = currentScene.get();
		if (currentScene_.id != this.currentSceneID) {
			throw Error();
		}

		for (const circuit of this.selectedCircuitIDs) {
			sceneManager.selectCircuitUnchecked(circuit);
		}
		for (const wireID of this.selectedWireIDs) {
			const wire = currentScene_.idToWire.get(wireID);
			if (wire == null) {
				throw Error();
			}

			sceneManager.selectWireUnchecked(wire);
		}
	}
	getDoURL(): URL {
		return DUMMY_URL;
	}
	getUndoURL(): URL {
		return DUMMY_URL;
	}
}
