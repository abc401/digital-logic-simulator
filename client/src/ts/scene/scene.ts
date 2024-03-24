import {
	CircuitSceneObject,
	CustomCircuitInputs,
	CustomCircuitOutputs
} from './objects/circuit.js';
import { Wire } from './objects/wire.js';
import { StackList } from '@ts/data-structures/stacklist.js';

export class Scene {
	// objects: Map<number, SceneObject> = new Map();
	// nextObjectId = 0;
	// customCircuitInputs: number | undefined;
	// customCircuitOutputs: number | undefined;
	name: string = '';
	customCircuitInputs: CustomCircuitInputs | undefined;
	customCircuitOutputs: CustomCircuitOutputs | undefined;

	circuits: StackList<CircuitSceneObject> = new StackList();
	// wires: Set<number> = new Set();
	wires: StackList<Wire> = new StackList();

	tmpCircuits: StackList<CircuitSceneObject> = new StackList();
	// wires: Set<number> = new Set();
	tmpWires: StackList<Wire> = new StackList();

	// colliders: Map<number, ColliderObject> = new Map();
	registerCircuitTmp(circuit: CircuitSceneObject) {
		this.tmpCircuits.push(circuit);
	}

	registerWireTmp(wire: Wire) {
		this.tmpWires.push(wire);
	}

	unregisterWireTmp(wire: Wire) {
		this.tmpWires.remove(wire);
	}

	commitTmpObjects() {
		for (let circuit of this.tmpCircuits.bottomToTop()) {
			this.circuits.push(circuit.data);
		}
		for (let wire of this.tmpWires.bottomToTop()) {
			this.wires.push(wire.data);
		}

		this.tmpCircuits = new StackList();
		this.tmpWires = new StackList();
	}

	registerCircuit(circuit: CircuitSceneObject) {
		// const id = this.nextObjectId;
		// this.nextObjectId += 1;
		// this.objects.set(id, circuit);
		// this.circuits.push(id);
		this.circuits.push(circuit);
		// this.colliders.set(id, new CircuitColliderObject(circuit.parentCircuit));
		// return id;
	}

	registerWire(wire: Wire) {
		// const id = this.nextObjectId;
		// this.nextObjectId += 1;
		// this.objects.set(id, wire);
		// this.wires.add(id);
		this.wires.push(wire);
		// return id;
	}

	unregisterWire(wire: Wire) {
		// this.objects.delete(id);
		// this.wires.delete(id);
		this.wires.remove(wire);
	}
}
