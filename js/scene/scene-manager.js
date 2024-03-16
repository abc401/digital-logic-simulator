import { CircuitColliderObject, } from "./objects/circuit.js";
import { domLog, secondaryCtx, viewManager } from "../main.js";
export var ConcreteObjectKind;
(function (ConcreteObjectKind) {
    ConcreteObjectKind["Circuit"] = "Circuit";
    ConcreteObjectKind["Wire"] = "Wire";
    ConcreteObjectKind["ConsumerPin"] = "ConsumerPin";
    ConcreteObjectKind["ProducerPin"] = "ProducerPin";
})(ConcreteObjectKind || (ConcreteObjectKind = {}));
export class Scene {
    constructor() {
        this.objects = new Map();
        this.nextObjectId = 0;
        this.circuits = new Set();
        this.wires = new Set();
        this.colliders = new Map();
    }
    registerCircuit(circuit) {
        const id = this.nextObjectId;
        this.nextObjectId += 1;
        this.objects.set(id, circuit);
        this.circuits.add(id);
        this.colliders.set(id, new CircuitColliderObject(circuit.parentCircuit));
        return id;
    }
    registerWire(wire) {
        const id = this.nextObjectId;
        this.nextObjectId += 1;
        this.objects.set(id, wire);
        this.wires.add(id);
        return id;
    }
    unregisterWire(id) {
        this.objects.delete(id);
        this.wires.delete(id);
    }
}
export class SceneManager {
    constructor() {
        this.selectedWires = new Set();
        this.selectedCircuits = new Set();
        this.scenes = new Map();
        this.currentSceneId = 0;
        this.currentScene = new Scene();
        this.newScene();
        this.setCurrentScene(SceneManager.HOME_SCENE_ID);
    }
    newScene() {
        const sceneId = this.currentSceneId;
        let scene = new Scene();
        this.currentSceneId += 1;
        this.scenes.set(sceneId, scene);
        return sceneId;
    }
    setCurrentScene(sceneId) {
        const scene = this.scenes.get(sceneId);
        if (scene == null) {
            domLog("[SceneManager.setCurrentScene] Provided sceneId is invalid.");
            throw Error();
        }
        this.currentScene = scene;
        this.selectedCircuits = new Set();
        this.selectedWires = new Set();
    }
    draw(ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        for (let id of this.currentScene.wires.values()) {
            const wire = this.currentScene.objects.get(id);
            if (wire == null) {
                domLog("[SceneManager.draw] Registered Wire turned out to be null");
            }
            wire.draw(ctx);
        }
        for (let id of this.currentScene.circuits.values()) {
            const circuit = this.currentScene.objects.get(id);
            if (circuit == null) {
                domLog("[SceneManager.draw] Registered Circuit turned out to be null");
            }
            circuit.draw(ctx);
        }
        let scene1 = this.scenes.get(1);
        if (scene1 == null) {
            // console.log("scene 1 does not exist");
            return;
        }
        secondaryCtx.clearRect(0, 0, secondaryCtx.canvas.width, secondaryCtx.canvas.height);
        for (let id of scene1.wires.values()) {
            const wire = scene1.objects.get(id);
            if (wire == null) {
                domLog("[SceneManager.draw] Registered Wire turned out to be null");
            }
            wire.draw(secondaryCtx);
        }
        for (let id of scene1.circuits.values()) {
            const circuit = scene1.objects.get(id);
            if (circuit == null) {
                domLog("[SceneManager.draw] Registered Circuit turned out to be null");
            }
            circuit.draw(secondaryCtx);
        }
    }
    clearSelectedCircuits() {
        for (let circuit of this.selectedCircuits.values()) {
            circuit.isSelected = false;
        }
        this.selectedCircuits = new Set();
        this.selectedWires = new Set();
    }
    selectCircuit(circuit) {
        if (this.selectedCircuits.has(circuit)) {
            return;
        }
        this.selectedCircuits.add(circuit);
        circuit.isSelected = true;
        console.log("[SceneManager] Selected Circuits: ", this.selectedCircuits);
        if (this.selectedCircuits.size === 1) {
            return;
        }
        for (let pin of circuit.parentCircuit.producerPins) {
            console.log("[SceneManager] ProducerPin: ", pin);
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
            console.log("[SceneManager] ConsumerPin: ", pin);
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
        console.log("[SceneManager] Selected Wires: ", this.selectedWires);
    }
    deselectCircuit(circuit) {
        console.log("Deselect Circuit");
        if (!this.selectedCircuits.has(circuit)) {
            return;
        }
        this.selectedCircuits.delete(circuit);
        circuit.isSelected = false;
        console.log("[SceneManager] Selected Circuits: ", this.selectedCircuits);
        if (this.selectedCircuits.size === 0) {
            return;
        }
        for (let pin of circuit.parentCircuit.producerPins) {
            console.log("[SceneManager] ProducerPin: ", pin);
            for (let wire of pin.wires) {
                if (wire.isSelected) {
                    this.selectedWires.delete(wire);
                    wire.isSelected = false;
                }
            }
        }
        for (let pin of circuit.parentCircuit.consumerPins) {
            console.log("[SceneManager] ConsumerPin: ", pin);
            if (pin.wire == null) {
                continue;
            }
            if (pin.wire.isSelected) {
                this.selectedWires.delete(pin.wire);
                pin.wire.isSelected = false;
            }
        }
        console.log("[SceneManager] Selected Wires: ", this.selectedWires);
    }
    selectWire(wire) {
        this.selectedWires.add(wire);
    }
    getObjectAt(locScr) {
        for (let object of this.currentScene.colliders.values()) {
            if (!object.looseCollisionCheck(viewManager.screenToWorld(locScr))) {
                continue;
            }
            const tightCollisionResult = object.tightCollisionCheck(viewManager.screenToWorld(locScr));
            if (tightCollisionResult == null) {
                continue;
            }
            return tightCollisionResult;
        }
        return undefined;
    }
}
SceneManager.HOME_SCENE_ID = 0;
