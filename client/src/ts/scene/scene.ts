import { CircuitSceneObject } from './objects/circuits/circuit.js';
import { CustomCircuit } from './objects/circuits/custom-circuit.js';
import { CustomCircuitOutputs } from './objects/circuits/custom-circuit-outputs.js';
import { CustomCircuitInputs } from './objects/circuits/custom-circuit-inputs.js';
import { Wire } from './objects/wire.js';
import { StackList } from '@ts/data-structures/stacklist.js';
import { sceneManager } from '@routes/+page.svelte';
import { customCircuits } from '@lib/stores/customCircuits.js';
import { HOME_SCENE_NAME } from '@ts/config.js';

export class Scene {
	name: string = '';
	customCircuitInputs: CustomCircuitInputs | undefined;
	customCircuitOutputs: CustomCircuitOutputs | undefined;

	circuits: StackList<CircuitSceneObject> = new StackList();
	wires: StackList<Wire> = new StackList();

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

	registerCircuit(circuit: CircuitSceneObject) {
		this.circuits.push(circuit);
		if (this.name != HOME_SCENE_NAME) {
			this.tmpCircuits.add(circuit);
		}
	}

	registerWire(wire: Wire) {
		this.wires.push(wire);
		if (this.name != HOME_SCENE_NAME) {
			this.tmpWires.add(wire);
		}
	}

	unregisterWire(wire: Wire) {
		this.wires.remove(wire);
		this.tmpWires.delete(wire);
	}

	reEvaluateCustomCircuits() {
		console.log(`${this.name} customCircuitInstances: `, this.customCircuitInstances);
		for (let [sceneName, entries] of this.customCircuitInstances) {
			let id = customCircuits.getSceneIdFor(sceneName);
			console.log('ID: ', id);
			if (id == null) {
				throw Error();
			}
			let scene = sceneManager.scenes.get(id);
			console.log('Scene: ', scene);
			if (scene == null) {
				throw Error();
			}
			if (entries.lastUpdateIdx === scene.lastUpdateIdx) {
				continue;
			}
			console.log('entries.lastUpdateIdx != scene.lastUpdateIdx');
			console.log(`${this.name} reevaluated`);
			for (let instance of entries.instances) {
				instance.updateCircuitGraph();
			}
			entries.lastUpdateIdx = scene.lastUpdateIdx;
		}
	}
}
