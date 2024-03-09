import { Circuit } from "./objects/circuit.js";
import { ProducerPin } from "./objects/producer-pin.js";
import { ConsumerPin } from "./objects/consumer-pin.js";
import { Wire } from "./objects/wire.js";
import { viewManager } from "../main.js";
import { BoundingBox, Vec2 } from "../math.js";

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

class Scene {
  circuits: Map<number, Circuit> = new Map();
  wires: Map<number, Wire> = new Map();
}

export interface Drawable {
  draw: (ctx: CanvasRenderingContext2D) => void;
}

export class SceneManager {
  private colliders: Map<number, ColliderObject> = new Map();
  drawablesBelow: Map<number, Drawable> = new Map();
  drawablesAbove: Map<number, Drawable> = new Map();

  currentColliderId: number = 0;
  currentDrawableId: number = 0;

  registerCollider(object: ColliderObject) {
    const id = this.currentColliderId;
    this.currentColliderId += 1;

    this.colliders.set(id, object);

    console.log("Objects: ", this.colliders);

    return id;
  }

  unregisterCollider(id: number) {
    const object = this.colliders.get(id);
    if (object == null) {
      return;
    }
    this.colliders.delete(id);

    console.log("Objects: ", this.colliders);
  }

  registerDrawable() {
    const id = this.currentDrawableId;
    this.currentDrawableId += 1;
    return id;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    for (let drawable of this.drawablesBelow.values()) {
      drawable.draw(ctx);
    }
    for (let drawable of this.drawablesAbove.values()) {
      drawable.draw(ctx);
    }
  }

  getObjectAt(locScr: Vec2) {
    for (let object of this.colliders.values()) {
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
