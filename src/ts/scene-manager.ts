import { Circuit } from "./scene-objects/circuit.js";
import { ProducerPin } from "./scene-objects/producer-pin.js";
import { ConsumerPin } from "./scene-objects/consumer-pin.js";
import { Wire } from "./scene-objects/wire.js";
import { viewManager } from "./main.js";
import { BoundingBox, Vec2 } from "./math.js";

export enum ConcreteObjectKind {
  Circuit = "Circuit",
  Wire = "Wire",
  ConsumerPin = "ConsumerPin",
  ProducerPin = "ProducerPin",
}

export class VirtualObject {
  kind: ConcreteObjectKind;
  concreteObject: any;
  boundingBoxWrl: BoundingBox;
  constructor(
    kind: ConcreteObjectKind,
    concreteObject: any,
    boundingBoxWrl: BoundingBox
  ) {
    this.kind = kind;
    this.concreteObject = concreteObject;
    this.boundingBoxWrl = boundingBoxWrl;
  }
}

export class SceneManager {
  circuits: Map<number, Circuit> = new Map();
  wires: Map<number, Wire> = new Map();
  consumerPins: Map<number, ConsumerPin> = new Map();
  producerPins: Map<number, ProducerPin> = new Map();
  objects: Map<number, VirtualObject> = new Map();
  currentID: number = 0;

  register(object: VirtualObject) {
    const id = this.currentID;
    this.currentID += 1;

    this.objects.set(id, object);

    if (object.kind === ConcreteObjectKind.Circuit) {
      this.circuits.set(id, object.concreteObject);
    } else if (object.kind === ConcreteObjectKind.ConsumerPin) {
      this.consumerPins.set(id, object.concreteObject);
    } else if (object.kind === ConcreteObjectKind.ProducerPin) {
      this.producerPins.set(id, object.concreteObject);
    } else {
      this.wires.set(id, object.concreteObject);
    }

    console.log("Objects: ", this.objects);

    return id;
  }

  unregister(id: number) {
    const object = this.objects.get(id);
    if (object == null) {
      return;
    }
    this.objects.delete(id);

    if (object.kind === ConcreteObjectKind.Circuit) {
      this.circuits.delete(id);
    } else if (object.kind === ConcreteObjectKind.Wire) {
      this.wires.delete(id);
    } else if (object.kind === ConcreteObjectKind.ConsumerPin) {
      this.consumerPins.delete(id);
    } else {
      this.producerPins.delete(id);
    }
    console.log("Objects: ", this.objects);
  }

  getObjectAt(locScr: Vec2) {
    for (let object of this.objects.values()) {
      if (
        object.boundingBoxWrl.pointIntersection(
          viewManager.screenToWorld(locScr)
        )
      ) {
        // console.log(`${object.kind}: `, object.concreteObject);
        return object;
      }
    }
  }
}
