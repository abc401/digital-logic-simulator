import { viewManager } from "./main.js";
import { BoundingBox, Vec2 } from "./math.js";

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

  getObjectAt(locS: Vec2) {
    for (let i = 0; i < this.virtualObjects.length; i++) {
      let virtualObject = this.virtualObjects[i];

      if (
        virtualObject.boundingBox.pointIntersection(
          viewManager.screenToWorld(locS)
        )
      ) {
        return virtualObject;
      }
    }
  }
}
