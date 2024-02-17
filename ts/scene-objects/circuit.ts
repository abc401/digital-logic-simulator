import { Vec2, Rect } from "../math.js";
import { ConcreteObjectKind, VirtualObject } from "../scene-manager.js";
import { sceneManager, simEngine, viewManager } from "../main.js";
import { SimEvent } from "../engine.js";
import { ConsumerPin } from "./consumer-pin.js";
import { ProducerPin } from "./producer-pin.js";

type CircuitUpdateHandeler = (self: Circuit) => void;

export class Circuit {
  static width = 100;
  static pinToPinDist = 70;

  rectWrl: Rect;

  isBeingHovered = false;

  consumerPins: ConsumerPin[];
  producerPins: ProducerPin[];

  update: CircuitUpdateHandeler;

  constructor(
    nConsumerPins: number,
    nProducerPins: number,
    pos_x: number,
    pos_y: number,
    update: CircuitUpdateHandeler,
    isInput: boolean = false
  ) {
    if (nConsumerPins % 1 !== 0) {
      throw Error(
        `Expected nConsumerPins to be integer but got: ${nConsumerPins}`
      );
    }
    if (nProducerPins % 1 !== 0) {
      throw Error(
        `Expected nProducerPins to be integer but got: ${nProducerPins}`
      );
    }

    this.rectWrl = new Rect(
      pos_x,
      pos_y,
      Circuit.width,
      nConsumerPins > nProducerPins ? nConsumerPins * 70 : nProducerPins * 70
    );

    this.consumerPins = Array(nConsumerPins);
    for (let i = 0; i < this.consumerPins.length; i++) {
      this.consumerPins[i] = new ConsumerPin(this, i);
    }

    this.producerPins = Array(nProducerPins);
    for (let i = 0; i < this.producerPins.length; i++) {
      this.producerPins[i] = new ProducerPin(this, i);
    }

    this.update = update;
    this.update(this);

    if (isInput) {
      simEngine.recurringEvents.push(new SimEvent(this, this.update));
    }

    sceneManager.register(this.getVirtualObject());
  }

  prodPinLocWrl(pinIndex: number) {
    return new Vec2(
      this.rectWrl.x + this.rectWrl.w,
      this.rectWrl.y + pinIndex * Circuit.pinToPinDist
    );
  }

  prodPinLocScr(pinIndex: number) {
    const rect = this.screenRect();
    return new Vec2(
      rect.x + rect.w,
      rect.y + pinIndex * Circuit.pinToPinDist * viewManager.zoomLevel
    );
  }

  conPinLocScr(pinIndex: number) {
    return viewManager.worldToScreen(
      new Vec2(this.rectWrl.x, this.rectWrl.y + pinIndex * 70)
    );
    // pos.x * zoomScale + panOffset.x,
    // pos.y * zoomScale + panOffset.y,
    // ConsumerPin.radius * zoomScale,
    // 0,
    // 2 * Math.PI
  }

  getVirtualObject() {
    return new VirtualObject(ConcreteObjectKind.Circuit, this, this.rectWrl);
  }

  screenRect() {
    return new Rect(
      this.rectWrl.x * viewManager.zoomLevel + viewManager.panOffset.x,
      this.rectWrl.y * viewManager.zoomLevel + viewManager.panOffset.y,
      Circuit.width * viewManager.zoomLevel,
      (this.consumerPins.length > this.producerPins.length
        ? this.consumerPins.length * 70
        : this.producerPins.length * 70) * viewManager.zoomLevel
    );
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (let i = 0; i < this.consumerPins.length; i++) {
      this.consumerPins[i].draw(ctx);
    }
    for (let i = 0; i < this.producerPins.length; i++) {
      this.producerPins[i].draw(ctx);
    }
    const boundingRect = this.screenRect();
    ctx.fillStyle = "cyan";
    ctx.fillRect(
      boundingRect.x,
      boundingRect.y,
      boundingRect.w,
      boundingRect.h
    );
    if (this.isBeingHovered) {
      ctx.strokeStyle = "black";
      ctx.lineWidth = 1;
      ctx.strokeRect(
        boundingRect.x,
        boundingRect.y,
        boundingRect.w,
        boundingRect.h
      );
    }
  }
}
