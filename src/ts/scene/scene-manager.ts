import {
  Circuit,
  CustomCircuitInputs,
  CustomCircuitOutputs,
} from "./objects/circuit.js";
import { ProducerPin } from "./objects/producer-pin.js";
import { ConsumerPin } from "./objects/consumer-pin.js";
import { Wire } from "./objects/wire.js";
import { domLog, secondaryCtx, viewManager } from "../main.js";
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

export class Scene {
  customCircuitIO:
    | {
        i: CustomCircuitInputs | undefined;
        o: CustomCircuitOutputs | undefined;
      }
    | undefined;
  colliders: Map<number, ColliderObject> = new Map();
  drawablesBelow: Map<number, Drawable> = new Map();
  drawablesAbove: Map<number, Drawable> = new Map();
}

export interface Drawable {
  draw: (ctx: CanvasRenderingContext2D) => void;
}

export class SceneManager {
  static HOME_SCENE_ID = 0;

  scenes: Map<number, Scene> = new Map();
  currentScene: Scene;

  currentColliderId: number = 0;
  currentDrawableId: number = 0;
  currentSceneId: number = 0;

  constructor() {
    this.currentScene = new Scene();
    this.newScene();
    this.setCurrentScene(SceneManager.HOME_SCENE_ID);
  }

  newScene() {
    const sceneId = this.currentSceneId;
    let scene = new Scene();

    if (sceneId === SceneManager.HOME_SCENE_ID) {
      scene.customCircuitIO = undefined;
    } else {
      scene.customCircuitIO = { i: undefined, o: undefined };
    }

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
  }

  registerCollider(object: ColliderObject) {
    const id = this.currentColliderId;
    this.currentColliderId += 1;

    this.currentScene.colliders.set(id, object);

    console.log("Objects: ", this.currentScene.colliders);

    return id;
  }

  unregisterCollider(id: number) {
    const object = this.currentScene.colliders.get(id);
    if (object == null) {
      return;
    }
    this.currentScene.colliders.delete(id);

    console.log("Objects: ", this.currentScene.colliders);
  }

  registerDrawable() {
    const id = this.currentDrawableId;
    this.currentDrawableId += 1;
    return id;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    for (let drawable of this.currentScene.drawablesBelow.values()) {
      drawable.draw(ctx);
    }
    for (let drawable of this.currentScene.drawablesAbove.values()) {
      drawable.draw(ctx);
    }
    let scene1 = this.scenes.get(1);
    if (scene1 == null) {
      console.log("scene 1 does not exist");
      return;
    }
    secondaryCtx.clearRect(
      0,
      0,
      secondaryCtx.canvas.width,
      secondaryCtx.canvas.height
    );

    for (let drawable of scene1.drawablesBelow.values()) {
      drawable.draw(secondaryCtx);
    }
    for (let drawable of scene1.drawablesAbove.values()) {
      drawable.draw(secondaryCtx);
    }
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
