import { type Circuit, CircuitSceneObject } from './objects/circuits/circuit.js';
import { CustomCircuitOutputs } from './objects/circuits/custom-circuit-outputs.js';
import { CustomCircuitInputs } from './objects/circuits/custom-circuit-inputs.js';
import { ProducerPin } from './objects/producer-pin.js';
import { ConsumerPin } from './objects/consumer-pin.js';
import { Wire } from './objects/wire.js';
// import { circuitCreators, domLog, secondaryCtx, viewManager } from '../main.js';
import { Vec2 } from '@ts/math.js';
import { secondaryCtx, viewManager } from '@routes/+page.svelte';
import { currentScene } from '@lib/stores/currentScene.js';
import { Scene } from './scene.js';
import { domLog } from '@lib/stores/debugging.js';
import { HOME_SCENE_ID, HOME_SCENE_NAME } from '@ts/config.js';
import { focusedCircuit } from '@lib/stores/mostRecentlySelectedCircuit.js';

export interface SceneObject {
	// id: number;
}

export let sceneUpdates = new Map<string, number>();

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
				object: any;
		  }
		| undefined;
}

export let debugObjects = {
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
		let defaultScene = new Scene();
		defaultScene.name = HOME_SCENE_NAME;
		this.scenes.set(HOME_SCENE_ID, defaultScene);

		this.setCurrentScene(HOME_SCENE_ID);
	}

	newCustomScene() {
		console.log('SceneManager: ', this);
		let scene = new Scene();

		const sceneId = this.nextSceneId;
		this.nextSceneId += 1;
		this.scenes.set(sceneId, scene);

		// this.setCurrentScene(sceneId);

		let customInputs = new CustomCircuitInputs();
		customInputs.configSceneObject(new Vec2(90, 220), scene);
		if (customInputs.sceneObject == null) {
			throw Error();
		}
		scene.circuits.push(customInputs.sceneObject);
		scene.customCircuitInputs = customInputs;

		let customOutputs = new CustomCircuitOutputs();
		customOutputs.configSceneObject(new Vec2(240, 220), scene);
		if (customOutputs.sceneObject == null) {
			throw Error();
		}

		scene.customCircuitOutputs = customOutputs;

		return sceneId;
	}

	setCurrentScene(sceneId: number) {
		console.log('SceneManager: ', this);
		const scene = this.scenes.get(sceneId);
		if (scene == null) {
			domLog('[SceneManager.setCurrentScene] Provided sceneId is invalid.');
			throw Error();
		}

		let currentScene_ = this.getCurrentScene();
		if (scene === currentScene_) {
			return;
		}

		currentScene_.commitTmpObjects();

		scene.reEvaluateCustomCircuits();

		currentScene.set(scene);

		// this.currentScene = scene;

		this.clearSelectedCircuits();
	}

	getCurrentScene() {
		let currentScene_ = new Scene();

		const unsubscribe = currentScene.subscribe((scene) => {
			currentScene_ = scene;
		});
		unsubscribe();
		return currentScene_;
	}

	draw(ctx: CanvasRenderingContext2D) {
		const currentScene = this.getCurrentScene();

		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		// for (let id of this.currentScene.wires.values()) {
		//   const wire = this.currentScene.objects.get(id);
		//   if (wire == null) {
		//     domLog("[SceneManager.draw] Registered Wire turned out to be null");
		//   }
		//   (wire as Wire).draw(ctx);
		// }
		for (let wire of currentScene.wires.bottomToTop()) {
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
		for (let circuit of currentScene.circuits.bottomToTop()) {
			// const circuit = this.currentScene.objects.get(id.data);
			// if (circuit == null) {
			// domLog("[SceneManager.draw] Registered Circuit turned out to be null");
			// }
			// (circuit as CircuitSceneObject).draw(ctx);
			circuit.data.draw(ctx);
		}

		this.debugDraw();
	}

	debugDraw() {
		secondaryCtx.clearRect(0, 0, secondaryCtx.canvas.width, secondaryCtx.canvas.height);
		for (let wire of debugObjects.wires) {
			wire.draw(secondaryCtx);
		}
		for (let circuit of debugObjects.circuits) {
			if (circuit.sceneObject == null) {
				throw Error();
			}
			circuit.sceneObject.draw(secondaryCtx);
		}
	}

	clearSelectedCircuits() {
		for (let circuit of this.selectedCircuits.values()) {
			circuit.isSelected = false;
		}
		this.selectedCircuits = new Set();
		focusedCircuit.set(undefined);

		for (let wire of this.selectedWires.values()) {
			wire.isSelected = false;
		}
		this.selectedWires = new Set();
	}

	selectCircuit(circuit: CircuitSceneObject) {
		if (this.selectedCircuits.has(circuit)) {
			return;
		}
		let currentScene = this.getCurrentScene();

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

		for (let pin of circuit.parentCircuit.producerPins) {
			console.log('[SceneManager] ProducerPin: ', pin);
			for (let wire of pin.wires) {
				if (wire.consumerPin == null) {
					continue;
				}
				if (wire.consumerPin.parentCircuit.sceneObject == null) {
					throw Error();
				}

				if (this.selectedCircuits.has(wire.consumerPin.parentCircuit.sceneObject)) {
					this.selectedWires.add(wire);
					wire.isSelected = true;
				}
			}
		}
		for (let pin of circuit.parentCircuit.consumerPins) {
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
				this.selectedWires.add(pin.wire);
				pin.wire.isSelected = true;
			}
		}
		console.log('[SceneManager] Selected Wires: ', this.selectedWires);
	}

	deselectCircuit(circuit: CircuitSceneObject) {
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

		for (let pin of circuit.parentCircuit.producerPins) {
			console.log('[SceneManager] ProducerPin: ', pin);
			for (let wire of pin.wires) {
				if (wire.isSelected) {
					this.deselectWire(wire);
				}
			}
		}
		for (let pin of circuit.parentCircuit.consumerPins) {
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

	selectWire(wire: Wire) {
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
		let currentScene = this.getCurrentScene();
		for (let circuit of currentScene.circuits.topToBottom()) {
			if (!circuit.data.looseCollisionCheck(viewManager.screenToWorld(locScr))) {
				continue;
			}
			const tightCollisionResult = circuit.data.tightCollisionCheck(
				viewManager.screenToWorld(locScr)
			);
			if (tightCollisionResult == null) {
				continue;
			}
			return tightCollisionResult;
		}
		return undefined;
	}
}
