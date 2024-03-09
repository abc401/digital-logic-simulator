import { Vec2, Rect } from "../../math.js";
import {
  ConcreteObjectKind,
  ColliderObject,
  Drawable,
} from "../scene-manager.js";
import { domLog, sceneManager, simEngine, viewManager } from "../../main.js";
import { SimEvent } from "../../engine.js";
import { ConsumerPin } from "./consumer-pin.js";
import { ProducerPin } from "./producer-pin.js";
import { PIN_EXTRUSION_WRL } from "@src/config.js";

type CircuitUpdateHandeler = (self: Circuit) => void;

export interface Circuit extends Drawable {
  tightRectWrl: Rect;
  looseRectWrl: Rect;
  consumerPins: ConsumerPin[];
  producerPins: ProducerPin[];
  updateHandeler: CircuitUpdateHandeler;
  setPos(posWrl: Vec2): void;
  draw: (ctx: CanvasRenderingContext2D) => void;
  onClicked: () => void;
}

function getCircuitLooseRectWrl(tightRectWrl: Rect) {
  return new Rect(
    tightRectWrl.x - PIN_EXTRUSION_WRL,
    tightRectWrl.y - PIN_EXTRUSION_WRL,
    tightRectWrl.w + 2 * PIN_EXTRUSION_WRL,
    tightRectWrl.h + 2 * PIN_EXTRUSION_WRL
  );
}

export class CircuitColliderObject implements ColliderObject {
  constructor(public circuit: Circuit) {}

  looseCollisionCheck(pointWrl: Vec2) {
    const res = this.circuit.looseRectWrl.pointIntersection(pointWrl);
    if (res) {
      console.log("Loose Collision Passed");
    }
    return res;
  }

  tightCollisionCheck(pointWrl: Vec2):
    | {
        kind: ConcreteObjectKind;
        object: any;
      }
    | undefined {
    if (this.circuit.tightRectWrl.pointIntersection(pointWrl)) {
      console.log("Tight Collision Passed");
      return { kind: ConcreteObjectKind.Circuit, object: this.circuit };
    }
    for (let pin of this.circuit.consumerPins) {
      if (pin.pointCollision(pointWrl)) {
        console.log("Tight Collision Passed");
        return { kind: ConcreteObjectKind.ConsumerPin, object: pin };
      }
    }
    for (let pin of this.circuit.producerPins) {
      if (pin.pointCollision(pointWrl)) {
        console.log("Tight Collision Passed");
        return { kind: ConcreteObjectKind.ProducerPin, object: pin };
      }
    }
    return undefined;
  }
}

export class InputCircuit implements Circuit {
  tightRectWrl: Rect;
  looseRectWrl: Rect;

  consumerPins: ConsumerPin[];
  producerPins: ProducerPin[];

  constructor(public value: boolean, pos_x: number, pos_y: number) {
    this.tightRectWrl = new Rect(pos_x, pos_y, 100, 70);
    this.looseRectWrl = getCircuitLooseRectWrl(this.tightRectWrl);

    this.consumerPins = new Array();

    this.producerPins = Array(1);
    for (let i = 0; i < this.producerPins.length; i++) {
      this.producerPins[i] = new ProducerPin(this, i);
    }

    this.updateHandeler(this);

    simEngine.recurringEvents.push(new SimEvent(this, this.updateHandeler));

    sceneManager.registerCollider(new CircuitColliderObject(this));
    const drawableId = sceneManager.registerDrawable();
    sceneManager.drawablesAbove.set(drawableId, this);
  }

  setPos(posWrl: Vec2) {
    this.tightRectWrl.xy = posWrl;
    this.looseRectWrl = getCircuitLooseRectWrl(this.tightRectWrl);
  }

  updateHandeler(self_: Circuit) {
    let self = self_ as InputCircuit;
    self.producerPins[0].setValue(self.value);
  }

  onClicked() {
    this.value = !this.value;
    this.producerPins[0].setValue(this.value);
  }

  // prodPinLocWrl(pinIndex: number) {
  //   return new Vec2(
  //     this.rectWrl.x + this.rectWrl.w,
  //     this.rectWrl.y + pinIndex * Circuit.pinToPinDist
  //   );
  // }

  // prodPinLocScr(pinIndex: number) {
  //   const rect = this.screenRect();
  //   return new Vec2(
  //     rect.x + rect.w,
  //     rect.y + pinIndex * Circuit.pinToPinDist * viewManager.zoomLevel
  //   );
  // }

  // conPinLocScr(pinIndex: number) {
  //   return viewManager.worldToScreen(
  //     new Vec2(this.rectWrl.x, this.rectWrl.y + pinIndex * 70)
  //   );
  //   // pos.x * zoomScale + panOffset.x,
  //   // pos.y * zoomScale + panOffset.y,
  //   // ConsumerPin.radius * zoomScale,
  //   // 0,
  //   // 2 * Math.PI
  // }

  // getVirtualObject() {
  //   return new VirtualObject(ConcreteObjectKind.Circuit, this, this.rectWrl);
  // }

  // screenRect() {
  //   return new Rect(
  //     this.rectWrl.x * viewManager.zoomLevel + viewManager.panOffset.x,
  //     this.rectWrl.y * viewManager.zoomLevel + viewManager.panOffset.y,
  //     Circuit.width * viewManager.zoomLevel,
  //     (this.consumerPins.length > this.producerPins.length
  //       ? this.consumerPins.length * 70
  //       : this.producerPins.length * 70) * viewManager.zoomLevel
  //   );
  // }

  draw(ctx: CanvasRenderingContext2D) {
    for (let i = 0; i < this.consumerPins.length; i++) {
      this.consumerPins[i].draw(ctx);
    }
    for (let i = 0; i < this.producerPins.length; i++) {
      this.producerPins[i].draw(ctx);
    }
    // domLog(`Value: ${this.value}, pin.Value: ${this.producerPins[0].value}`);
    const boundingRect = viewManager.worldToScreenRect(this.tightRectWrl);
    ctx.fillStyle = "cyan";
    ctx.fillRect(
      boundingRect.x,
      boundingRect.y,
      boundingRect.w,
      boundingRect.h
    );
  }
}

export class ProcessingCircuit implements Circuit {
  tightRectWrl: Rect;
  looseRectWrl: Rect;

  consumerPins: ConsumerPin[];
  producerPins: ProducerPin[];
  onClicked = () => {};

  constructor(
    nConsumerPins: number,
    nProducerPins: number,
    public updateHandeler: CircuitUpdateHandeler,
    pos_x: number,
    pos_y: number
  ) {
    this.tightRectWrl = new Rect(
      pos_x,
      pos_y,
      100,
      nConsumerPins > nProducerPins ? nConsumerPins * 70 : nProducerPins * 70
    );
    this.looseRectWrl = getCircuitLooseRectWrl(this.tightRectWrl);

    this.producerPins = new Array(nProducerPins);
    for (let i = 0; i < nProducerPins; i++) {
      this.producerPins[i] = new ProducerPin(this, i);
    }

    this.consumerPins = new Array(nConsumerPins);
    for (let i = 0; i < nConsumerPins; i++) {
      this.consumerPins[i] = new ConsumerPin(this, i);
    }

    this.updateHandeler(this);

    sceneManager.registerCollider(
      // new ColliderObject(ConcreteObjectKind.Circuit, this, this.rectWrl)
      new CircuitColliderObject(this)
    );
    const drawableId = sceneManager.registerDrawable();
    sceneManager.drawablesAbove.set(drawableId, this);
  }

  setPos(posWrl: Vec2) {
    this.tightRectWrl.xy = posWrl;
    this.looseRectWrl = getCircuitLooseRectWrl(this.tightRectWrl);
  }

  draw(ctx: CanvasRenderingContext2D) {
    const boundingRect = viewManager.worldToScreenRect(this.tightRectWrl);
    ctx.fillStyle = "cyan";
    ctx.fillRect(
      boundingRect.x,
      boundingRect.y,
      boundingRect.w,
      boundingRect.h
    );
    for (let i = 0; i < this.consumerPins.length; i++) {
      this.consumerPins[i].draw(ctx);
    }
    for (let i = 0; i < this.producerPins.length; i++) {
      this.producerPins[i].draw(ctx);
    }
  }
}

// export class CustomCircuit implements Circuit {}
