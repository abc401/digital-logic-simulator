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
  virtualObjects: VirtualObject[];

  constructor() {
    this.virtualObjects = [];
  }

  track(object: VirtualObject) {
    this.virtualObjects.push(object);
  }

  getObjectAt(locScr: Vec2) {
    for (let i = 0; i < this.virtualObjects.length; i++) {
      let virtualObject = this.virtualObjects[i];

      if (
        virtualObject.boundingBoxWrl.pointIntersection(
          viewManager.screenToWorld(locScr)
        )
      ) {
        // console.log(`${virtualObject.kind}: `, virtualObject.concreteObject);
        return virtualObject;
      }
    }
  }
}
