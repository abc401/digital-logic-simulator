import { Vec2, Rect } from "../math.js";
import { ConcreteObjectKind, VirtualObject } from "../scene-manager.js";
import { domLog, sceneManager, simEngine, viewManager } from "../main.js";
import { SimEvent } from "../engine.js";
import { ConsumerPin } from "./consumer-pin.js";
import { ProducerPin } from "./producer-pin.js";

type CircuitUpdateHandeler = (self: Circuit) => void;

export interface Circuit {
  rectWrl: Rect;
  consumerPins: ConsumerPin[];
  producerPins: ProducerPin[];
  updateHandeler: CircuitUpdateHandeler;
  draw: (ctx: CanvasRenderingContext2D) => void;
  onClicked: () => void;
}

export class InputCircuit implements Circuit {
  rectWrl: Rect;

  consumerPins: ConsumerPin[];
  producerPins: ProducerPin[];

  constructor(public value: boolean, pos_x: number, pos_y: number) {
    this.rectWrl = new Rect(pos_x, pos_y, 100, 70);

    this.consumerPins = new Array();

    this.producerPins = Array(1);
    for (let i = 0; i < this.producerPins.length; i++) {
      this.producerPins[i] = new ProducerPin(this, i);
    }

    this.updateHandeler(this);

    simEngine.recurringEvents.push(new SimEvent(this, this.updateHandeler));

    sceneManager.register(
      new VirtualObject(ConcreteObjectKind.Circuit, this, this.rectWrl)
    );
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
    const boundingRect = viewManager.worldToScreenRect(this.rectWrl);
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
  rectWrl: Rect;

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
    this.rectWrl = new Rect(
      pos_x,
      pos_y,
      100,
      nConsumerPins > nProducerPins ? nConsumerPins * 70 : nProducerPins * 70
    );
    this.producerPins = new Array(nProducerPins);
    for (let i = 0; i < nProducerPins; i++) {
      this.producerPins[i] = new ProducerPin(this, i);
    }

    this.consumerPins = new Array(nConsumerPins);
    for (let i = 0; i < nConsumerPins; i++) {
      this.consumerPins[i] = new ConsumerPin(this, i);
    }

    this.updateHandeler(this);

    sceneManager.register(
      new VirtualObject(ConcreteObjectKind.Circuit, this, this.rectWrl)
    );
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (let i = 0; i < this.consumerPins.length; i++) {
      this.consumerPins[i].draw(ctx);
    }
    for (let i = 0; i < this.producerPins.length; i++) {
      this.producerPins[i].draw(ctx);
    }
    const boundingRect = viewManager.worldToScreenRect(this.rectWrl);
    ctx.fillStyle = "cyan";
    ctx.fillRect(
      boundingRect.x,
      boundingRect.y,
      boundingRect.w,
      boundingRect.h
    );
  }
}
