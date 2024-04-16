// import { clipboard, sceneManager } from '@ts/main';
import { ctx, sceneManager, viewManager } from '@routes/+page.svelte';
import {
	type Circuit,
	cloneGraphAfterCircuit,
	CircuitSceneObject,
	getPropSetter
} from '@ts/scene/objects/circuits/circuit';
import { Wire } from '@ts/scene/objects/wire';
import type { UserAction } from './actions-manager';
import { currentScene, type ID } from '../scene/scene';
import type { Vec2 } from '../math';
import { circuitProps } from '@src/lib/stores/focusedCircuit';
import { domLog } from '@src/lib/stores/debugging';

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

export class CreateCircuitUserAction implements UserAction {
	name = '';
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
			viewManager.screenToWorld(this.locScr),
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
}

export class DeleteWireUserAction implements UserAction {
	name = '';

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
}

export class CreateWireUserAction implements UserAction {
	name = '';
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
}

export class SetCircuitPropUserAction implements UserAction {
	name = '';

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
}

export class SelectCircuitUserAction implements UserAction {
	name = '';
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
}

export class DeselectCircuitUserAction implements UserAction {
	name = '';
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
}
export class SwitchSceneUserAction implements UserAction {
	name = '';
	private fromSceneID: ID;
	constructor(private toSceneID: ID) {
		const currentScene_ = currentScene.get();
		if (currentScene_.id == null) {
			throw Error();
		}
		this.fromSceneID = currentScene_.id;
	}

	do(): void {
		const toScene = sceneManager.scenes.get(this.toSceneID);
		if (toScene == null) {
			domLog('[SceneManager.setCurrentScene] Provided sceneId is invalid.');
			throw Error();
		}

		console.log('SwitchSceneUserAction.do');
		currentScene.set(toScene);
	}

	undo(): void {
		const fromScene = sceneManager.scenes.get(this.fromSceneID);
		if (fromScene == null) {
			domLog('[SceneManager.setCurrentScene] Provided sceneId is invalid.');
			throw Error();
		}

		console.log('SwitchSceneUserAction.undo');
		currentScene.set(fromScene);
	}
}
