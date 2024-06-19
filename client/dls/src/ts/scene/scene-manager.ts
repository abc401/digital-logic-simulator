import { type Circuit } from './objects/circuits/circuit.js';
import { CircuitSceneObject } from './objects/circuits/circuit.js';
import { Wire } from './objects/wire.js';
// import { circuitCreators, domLog, secondaryCtx, viewManager } from '../main.js';
import { Vec2 } from '@ts/math.js';
import { actionsManager, view } from '@src/routes/dls/+page.svelte';
import { Scene, type ID } from './scene.js';
import { currentScene } from '@stores/currentScene';
import { HOME_SCENE_ID, HOME_SCENE_NAME } from '@ts/config.js';
import { focusedCircuit } from '@lib/stores/focusedCircuit.js';
import type { ProducerPin } from './objects/producer-pin.js';
import type { ConsumerPin } from './objects/consumer-pin.js';
import { SwitchSceneUserAction } from '../interactivity/actions.js';

export interface SceneObject {
	// id: number;
}

// export let sceneUpdates = new Map<string, number>();

export enum ConcreteObjectKind {
	Circuit = 'Circuit',
	Wire = 'Wire',
	ConsumerPin = 'ConsumerPin',
	ProducerPin = 'ProducerPin'
}

export interface ColliderObject {
	looseCollisionCheck(pointWrl: Vec2): boolean;
	tightCollisionCheck(pointWrl: Vec2):
		| {
				kind: ConcreteObjectKind;
				object: Circuit | ProducerPin | ConsumerPin;
		  }
		| undefined;
}

export const debugObjects = {
	circuits: new Array<Circuit>(),
	wires: new Array<Wire>()
};

export class SceneManager {
	selectedWires: Set<Wire> = new Set();
	selectedCircuits: Set<CircuitSceneObject> = new Set();

	scenes: Map<number, Scene> = new Map();
	// currentScene: Scene;

	nextSceneId = 1;

	constructor() {
		// this.currentScene = new Scene();
		// this.newScene();
		// const defaultScene = new Scene();
		// defaultScene.name = HOME_SCENE_NAME;
		// this.registerSceneWithID(HOME_SCENE_ID, defaultScene);
		// // this.setCurrentScene(HOME_SCENE_ID);
		// currentScene.setWithoutCommitting(defaultScene);
	}

	getNextSceneID() {
		const nextID = this.nextSceneId;
		this.nextSceneId += 1;
		return nextID;
	}

	registerSceneWithID(id: ID, scene: Scene) {
		this.scenes.set(id, scene);
		scene.id = id;
	}

	unregisterScene(id: ID) {
		const scene = this.scenes.get(id);
		if (scene == null) {
			throw Error();
		}
		const currentScene = this.getCurrentScene();

		if (currentScene != null && currentScene.name === scene.name) {
			throw Error();
		}

		this.scenes.delete(id);
		scene.id = undefined;
	}

	// newCustomScene() {
	// 	console.log('SceneManager: ', this);
	// 	const scene = new Scene();

	// 	const sceneId = this.nextSceneId;
	// 	this.nextSceneId += 1;
	// 	this.scenes.set(sceneId, scene);

	// 	// this.setCurrentScene(sceneId);

	// 	const customInputs = new CustomCircuitInputs();
	// 	customInputs.configSceneObject(new Vec2(90, 220), scene);
	// 	if (customInputs.sceneObject == null) {
	// 		throw Error();
	// 	}
	// 	scene.circuits.push(customInputs.sceneObject);
	// 	scene.customCircuitInputs = customInputs;

	// 	const customOutputs = new CustomCircuitOutputs();
	// 	customOutputs.configSceneObject(new Vec2(240, 220), scene);
	// 	if (customOutputs.sceneObject == null) {
	// 		throw Error();
	// 	}

	// 	scene.customCircuitOutputs = customOutputs;

	// 	return sceneId;
	// }

	setCurrentScene(sceneId: number) {
		actionsManager.do(new SwitchSceneUserAction(sceneId));
		// this.deselectAll();
	}

	getCurrentScene() {
		return currentScene.get();
	}

	draw(ctx: CanvasRenderingContext2D) {
		const currentScene = this.getCurrentScene();
		if (currentScene == null) {
			throw Error();
		}

		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		// for (let id of this.currentScene.wires.values()) {
		//   const wire = this.currentScene.objects.get(id);
		//   if (wire == null) {
		//     domLog("[SceneManager.draw] Registered Wire turned out to be null");
		//   }
		//   (wire as Wire).draw(ctx);
		// }
		for (const wire of currentScene.wires.bottomToTop()) {
			// const wire = this.currentScene.objects.get(id);
			// if (wire == null) {
			// domLog("[SceneManager.draw] Registered Wire turned out to be null");
			// }
			// (wire as Wire).draw(ctx);
			wire.data.draw(ctx);
		}

		// for (let id of this.currentScene.circuits.bottomToTop()) {
		//   const circuit = this.currentScene.objects.get(id.data);
		//   if (circuit == null) {
		//     domLog("[SceneManager.draw] Registered Circuit turned out to be null");
		//   }
		//   (circuit as CircuitSceneObject).draw(ctx);
		// }
		for (const circuit of currentScene.circuits.bottomToTop()) {
			// const circuit = this.currentScene.objects.get(id.data);
			// if (circuit == null) {
			// domLog("[SceneManager.draw] Registered Circuit turned out to be null");
			// }
			// (circuit as CircuitSceneObject).draw(ctx);
			circuit.data.draw(ctx);
		}
		if (currentScene.wireBeingCreated != null) {
			currentScene.wireBeingCreated.draw(ctx);
		}

		// this.debugDraw();
	}

	// debugDraw() {
	// 	secondaryCtx.clearRect(0, 0, secondaryCtx.canvas.width, secondaryCtx.canvas.height);
	// 	for (let wire of debugObjects.wires) {
	// 		wire.draw(secondaryCtx);
	// 	}
	// 	for (let circuit of debugObjects.circuits) {
	// 		if (circuit.sceneObject == null) {
	// 			throw Error();
	// 		}
	// 		circuit.sceneObject.draw(secondaryCtx);
	// 	}
	// }

	deselectAll() {
		for (const circuit of this.selectedCircuits.values()) {
			circuit.isSelected = false;
		}
		this.selectedCircuits = new Set();
		focusedCircuit.set(undefined);

		for (const wire of this.selectedWires.values()) {
			wire.isSelected = false;
		}
		this.selectedWires = new Set();
	}

	deselectAllCircuits() {
		for (const circuit of this.selectedCircuits.values()) {
			circuit.isSelected = false;
		}
		this.selectedCircuits = new Set();
	}

	selectCircuit(id: ID) {
		const currentScene = this.getCurrentScene();
		if (currentScene == null) {
			throw Error();
		}
		const circuit = currentScene.idToCircuit.get(id);

		if (circuit == null) {
			throw Error();
		}

		if (this.selectedCircuits.has(circuit)) {
			return;
		}

		currentScene.circuits.remove(circuit);
		currentScene.circuits.push(circuit);

		this.selectedCircuits.add(circuit);
		circuit.isSelected = true;

		if (this.selectedCircuits.size != 1) {
			focusedCircuit.set(undefined);
		} else {
			focusedCircuit.set(circuit);
		}

		if (circuit.onClicked != null) {
			circuit.onClicked(circuit.parentCircuit);
		}

		console.log('[SceneManager] Selected Circuits: ', this.selectedCircuits);

		if (this.selectedCircuits.size === 1) {
			return;
		}

		for (const pin of circuit.parentCircuit.producerPins) {
			console.log('[SceneManager] ProducerPin: ', pin);
			for (const wire of pin.wires) {
				if (wire.consumerPin == null) {
					continue;
				}
				if (wire.consumerPin.parentCircuit.sceneObject == null) {
					throw Error();
				}

				if (this.selectedCircuits.has(wire.consumerPin.parentCircuit.sceneObject)) {
					this.selectWireUnchecked(wire);
					// this.selectedWires.add(wire);
					// wire.isSelected = true;
				}
			}
		}
		for (const pin of circuit.parentCircuit.consumerPins) {
			console.log('[SceneManager] ConsumerPin: ', pin);
			if (pin.wire == null) {
				continue;
			}
			if (pin.wire.producerPin == null) {
				continue;
			}

			if (pin.wire.producerPin.parentCircuit.sceneObject == null) {
				throw Error();
			}

			if (this.selectedCircuits.has(pin.wire.producerPin.parentCircuit.sceneObject)) {
				this.selectWireUnchecked(pin.wire);
				// this.selectedWires.add(pin.wire);
				// pin.wire.isSelected = true;
			}
		}
		console.log('[SceneManager] Selected Wires: ', this.selectedWires);
	}
	selectCircuitUnchecked(id: ID) {
		const currentScene = this.getCurrentScene();
		if (currentScene == null) {
			throw Error();
		}
		const circuit = currentScene.idToCircuit.get(id);

		if (circuit == null) {
			throw Error();
		}

		this.selectedCircuits.add(circuit);
		circuit.isSelected = true;

		console.log('[SceneManager] Selected Circuits: ', this.selectedCircuits);
	}

	deselectCircuit(id: ID) {
		const currentScene = this.getCurrentScene();
		if (currentScene == null) {
			throw Error();
		}
		const circuit = currentScene.idToCircuit.get(id);

		if (circuit == null) {
			throw Error();
		}

		console.log('Deselect Circuit');

		if (!this.selectedCircuits.has(circuit)) {
			return;
		}

		this.selectedCircuits.delete(circuit);
		focusedCircuit.set(undefined);
		circuit.isSelected = false;

		console.log('[SceneManager] Selected Circuits: ', this.selectedCircuits);
		if (this.selectedCircuits.size === 0) {
			return;
		}

		for (const pin of circuit.parentCircuit.producerPins) {
			console.log('[SceneManager] ProducerPin: ', pin);
			for (const wire of pin.wires) {
				if (wire.isSelected) {
					this.deselectWire(wire);
				}
			}
		}
		for (const pin of circuit.parentCircuit.consumerPins) {
			console.log('[SceneManager] ConsumerPin: ', pin);
			if (pin.wire == null) {
				continue;
			}
			if (pin.wire.isSelected) {
				this.deselectWire(pin.wire);
			}
		}
		console.log('[SceneManager] Selected Wires: ', this.selectedWires);
	}

	selectWireUnchecked(wire: Wire) {
		if (wire.id == null) {
			throw Error();
		}

		console.log('Selected wire: ', wire);
		this.selectedWires.add(wire);
		wire.isSelected = true;
	}

	deselectWire(wire: Wire) {
		this.selectedWires.delete(wire);
		wire.isSelected = false;
	}

	getObjectAt(locScr: Vec2) {
		// for (let object of this.currentScene.colliders.values()) {
		//   if (!object.looseCollisionCheck(viewManager.screenToWorld(locScr))) {
		//     continue;
		//   }
		//   const tightCollisionResult = object.tightCollisionCheck(
		//     viewManager.screenToWorld(locScr)
		//   );
		//   if (tightCollisionResult == null) {
		//     continue;
		//   }
		//   return tightCollisionResult;
		// }
		// return undefined;
		const currentScene = this.getCurrentScene();
		if (currentScene == null) {
			throw Error();
		}
		for (const circuit of currentScene.circuits.topToBottom()) {
			if (!circuit.data.looseCollisionCheck(view.screenToWorld(locScr))) {
				continue;
			}
			const tightCollisionResult = circuit.data.tightCollisionCheck(view.screenToWorld(locScr));
			if (tightCollisionResult == null) {
				continue;
			}
			return tightCollisionResult;
		}
		return undefined;
	}
}
