import {
  Circuit,
  CircuitColliderObject,
  CircuitSceneObject,
  CustomCircuitInputs,
  CustomCircuitOutputs,
} from "./objects/circuit.js";
import { ProducerPin } from "./objects/producer-pin.js";
import { ConsumerPin } from "./objects/consumer-pin.js";
import { Wire } from "./objects/wire.js";
import { domLog, secondaryCtx, viewManager } from "../main.js";
import { BoundingBox, Vec2 } from "../math.js";

export interface SceneObject {
  id: number;
}

export enum ConcreteObjectKind {
  Circuit = "Circuit",
  Wire = "Wire",
  ConsumerPin = "ConsumerPin",
  ProducerPin = "ProducerPin",
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

export class Scene {
  objects: Map<number, SceneObject> = new Map();
  nextObjectId = 0;

  customCircuitInputs: number | undefined;
  customCircuitOutputs: number | undefined;

  circuits: Set<number> = new Set();
  wires: Set<number> = new Set();

  colliders: Map<number, ColliderObject> = new Map();

  registerCircuit(circuit: CircuitSceneObject) {
    const id = this.nextObjectId;
    this.nextObjectId += 1;
    this.objects.set(id, circuit);
    this.circuits.add(id);
    this.colliders.set(id, new CircuitColliderObject(circuit.parentCircuit));
    return id;
  }

  registerWire(wire: Wire) {
    const id = this.nextObjectId;
    this.nextObjectId += 1;
    this.objects.set(id, wire);
    this.wires.add(id);
    return id;
  }

  unregisterWire(id: number) {
    this.objects.delete(id);
    this.wires.delete(id);
  }
}

export let debugObjects = {
  circuits: new Array<Circuit>(),
  wires: new Array<Wire>(),
};

export class SceneManager {
  static HOME_SCENE_ID = 0;

  selectedWires: Set<Wire> = new Set();
  selectedCircuits: Set<CircuitSceneObject> = new Set();

  scenes: Map<number, Scene> = new Map();
  currentScene: Scene;

  currentSceneId: number = 0;

  constructor() {
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

  setCurrentScene(sceneId: number) {
    const scene = this.scenes.get(sceneId);
    if (scene == null) {
      domLog("[SceneManager.setCurrentScene] Provided sceneId is invalid.");
      throw Error();
    }
    this.currentScene = scene;
    this.clearSelectedCircuits();
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    for (let id of this.currentScene.wires.values()) {
      const wire = this.currentScene.objects.get(id);
      if (wire == null) {
        domLog("[SceneManager.draw] Registered Wire turned out to be null");
      }
      (wire as Wire).draw(ctx);
    }
    for (let id of this.currentScene.circuits.values()) {
      const circuit = this.currentScene.objects.get(id);
      if (circuit == null) {
        domLog("[SceneManager.draw] Registered Circuit turned out to be null");
      }
      (circuit as CircuitSceneObject).draw(ctx);
    }
    this.debugDraw();
  }

  debugDraw() {
    secondaryCtx.clearRect(
      0,
      0,
      secondaryCtx.canvas.width,
      secondaryCtx.canvas.height
    );
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

    for (let wire of this.selectedWires.values()) {
      wire.isSelected = false;
    }
    this.selectedWires = new Set();
  }

  selectCircuit(circuit: CircuitSceneObject) {
    if (this.selectedCircuits.has(circuit)) {
      return;
    }

    this.selectedCircuits.add(circuit);
    circuit.isSelected = true;
    if (circuit.onClicked != null) {
      circuit.onClicked(circuit.parentCircuit);
    }
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

        if (
          this.selectedCircuits.has(wire.consumerPin.parentCircuit.sceneObject)
        ) {
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

      if (
        this.selectedCircuits.has(
          pin.wire.producerPin.parentCircuit.sceneObject
        )
      ) {
        this.selectedWires.add(pin.wire);
        pin.wire.isSelected = true;
      }
    }
    console.log("[SceneManager] Selected Wires: ", this.selectedWires);
  }

  deselectCircuit(circuit: CircuitSceneObject) {
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
          this.deselectWire(wire);
        }
      }
    }
    for (let pin of circuit.parentCircuit.consumerPins) {
      console.log("[SceneManager] ConsumerPin: ", pin);
      if (pin.wire == null) {
        continue;
      }
      if (pin.wire.isSelected) {
        this.deselectWire(pin.wire);
      }
    }
    console.log("[SceneManager] Selected Wires: ", this.selectedWires);
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
    for (let object of this.currentScene.colliders.values()) {
      if (!object.looseCollisionCheck(viewManager.screenToWorld(locScr))) {
        continue;
      }
      const tightCollisionResult = object.tightCollisionCheck(
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
