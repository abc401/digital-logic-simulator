import { CustomCircuit } from './objects/circuits/custom-circuit.js';
import { CustomCircuitOutputs } from './objects/circuits/custom-circuit-outputs.js';
import { CustomCircuitInputs } from './objects/circuits/custom-circuit-inputs.js';
import { Wire } from './objects/wire.js';
import { StackList } from '@ts/data-structures/stacklist.js';
import { sceneManager } from '@routes/+page.svelte';
import { integratedCircuits } from '@src/lib/stores/integrated-circuits.js';
import { HOME_SCENE_NAME } from '@ts/config.js';
import { writable } from 'svelte/store';
import { CircuitSceneObject, type Circuit } from './objects/circuits/circuit.js';
import type { UserAction } from '../actions-manager.js';

// export class AddCircuit implements Action {
// 	circuitID: ID;
// 	constructor(private targetScene: Scene, private circuit: Circuit) {
// 		this.circuitID = targetScene.getNextID();
// 	}
// 	do(): void {
// 		CircuitSceneObject.new(this.circuit)
// 		this.targetScene.registerCircuitWithID(this.circuitID)
// 	}
// 	undo(): void {}
// }

export type ID = number;

export class Scene {
	name: string = '';
	customCircuitInputs: CustomCircuitInputs | undefined;
	customCircuitOutputs: CustomCircuitOutputs | undefined;

	circuits: StackList<CircuitSceneObject> = new StackList();
	wires: StackList<Wire> = new StackList();

	currentObjectID = 0;
	idToCircuit: Map<ID, CircuitSceneObject> = new Map();
	idToWire: Map<ID, Wire> = new Map();

	tmpCircuits = new Set<CircuitSceneObject>();
	tmpWires = new Set<Wire>();

	lastUpdateIdx = 0;

	customCircuitInstances = new Map<
		string,
		{ lastUpdateIdx: number; instances: Set<CustomCircuit> }
	>();

	commitTmpObjects() {
		if (this.tmpCircuits.size > 0 || this.tmpWires.size > 0) {
			this.lastUpdateIdx += 1;
			console.log(`${this.name} updated with index ${this.lastUpdateIdx}`);
		} else {
			console.log(`${this.name} wasnt updated`);
		}
		this.tmpCircuits = new Set();
		this.tmpWires = new Set();
		console.log(`${this.name} Commited`);
	}

	getNextID() {
		const nextID = this.currentObjectID;
		this.currentObjectID += 1;
		return nextID;
	}

	/**
	 *  Before registering a circuit with this function please
	 *  ensure that the passed in id is not already taken
	 */
	registerCircuitWithID(id: ID, circuit: CircuitSceneObject) {
		this.idToCircuit.set(id, circuit);
		circuit.id = id;

		this.circuits.push(circuit);
		if (this.name != HOME_SCENE_NAME) {
			this.tmpCircuits.add(circuit);
		}
	}

	registerCircuit(circuit: CircuitSceneObject) {
		const id = this.getNextID();
		this.registerCircuitWithID(id, circuit);
	}

	unregisterCircuit(id: ID) {
		const circuit = this.idToCircuit.get(id);
		if (circuit == null) {
			throw Error();
		}

		this.idToCircuit.delete(id);
		this.circuits.remove(circuit);
		this.tmpCircuits.delete(circuit);
	}

	/**
	 *  Before registering a wire with this function please
	 *  ensure that the passed in id is not already taken
	 */
	registerWireWithId(id: ID, wire: Wire) {
		this.idToWire.set(id, wire);
		wire.id = id;

		this.wires.push(wire);
		if (this.name != HOME_SCENE_NAME) {
			this.tmpWires.add(wire);
		}
	}

	registerWire(wire: Wire) {
		const id = this.getNextID();
		this.registerWireWithId(id, wire);
	}

	unregisterWire(id: ID) {
		const wire = this.idToWire.get(id);
		if (wire == null) {
			throw Error();
		}

		this.idToWire.delete(id);
		this.wires.remove(wire);
		this.tmpWires.delete(wire);
	}

	reEvaluateCustomCircuits() {
		console.log(`${this.name} customCircuitInstances: `, this.customCircuitInstances);
		for (const [sceneName, entries] of this.customCircuitInstances) {
			const id = integratedCircuits.getSceneIdFor(sceneName);
			console.log('ID: ', id);
			if (id == null) {
				throw Error();
			}
			const scene = sceneManager.scenes.get(id);
			console.log('Scene: ', scene);
			if (scene == null) {
				throw Error();
			}
			if (entries.lastUpdateIdx === scene.lastUpdateIdx) {
				continue;
			}
			console.log('entries.lastUpdateIdx != scene.lastUpdateIdx');
			console.log(`${this.name} reevaluated`);
			for (const instance of entries.instances) {
				instance.updateCircuitGraph();
			}
			entries.lastUpdateIdx = scene.lastUpdateIdx;
		}
	}
}

const { subscribe, set } = writable(new Scene());

export const currentScene = {
	subscribe,
	set
};
