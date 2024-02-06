import {
  Circuit,
  CircuitUpdateHandeler,
  ConsumerPin,
  ProducerPin,
  Wire,
} from "./circuit";
import { BoundingBox, Vec2 } from "./math";
import { Scheduler } from "./scheduler";

export enum ConcreteObjectKind {
  Circuit,
  Wire,
  InputPin,
  OutputPin,
}

export class VirtualObject {
  kind: ConcreteObjectKind;
  concreteObject: any;
  boundingBox: BoundingBox;
  constructor(
    kind: ConcreteObjectKind,
    concreteObject: any,
    boundingBox: BoundingBox
  ) {
    this.kind = kind;
    this.concreteObject = concreteObject;
    this.boundingBox = boundingBox;
  }
}

export class SceneManager {
  virtualObjects: VirtualObject[];

  constructor() {
    this.virtualObjects = [];
  }

  track(object: VirtualObject) {
    this.virtualObjects.push(object);
  }

  getObjectAt(coord: Vec2) {
    for (let i = 0; i < this.virtualObjects.length; i++) {
      let virtualObject = this.virtualObjects[i];
      if (virtualObject.boundingBox.pointIntersection(coord)) {
        return virtualObject;
      }
    }
  }
}
