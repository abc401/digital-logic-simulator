import { Vec2, Rect } from "./math.js";
import { zoomLevel, panOffset, worldToScreen } from "./canvas.js";
import { ConcreteObjectKind, VirtualObject } from "./scene-manager.js";
import { sceneManager, scheduler, viewManager } from "./main.js";

export class Wire {
  constructor(
    readonly producerCircuit: Circuit,
    readonly producerPinIndex: number,
    readonly consumerCircuit: Circuit,
    readonly consumerPinIndex: number
  ) {
    producerCircuit.producerPins[producerPinIndex].wires.push(this);

    const producedValue = producerCircuit.producerPins[producerPinIndex].value;
    const consumedValue = consumerCircuit.consumerPins[consumerPinIndex].value;
    if (producedValue !== consumedValue) {
      this.propogateValue(producedValue);
    }
  }

  propogateValue(value: boolean) {
    let consumerPin = this.consumerCircuit.consumerPins[this.consumerPinIndex];
    if (value === consumerPin.value) {
      return;
    }
    consumerPin.value = value;

    scheduler.nextFrameEvents.enqueue(this.consumerCircuit);
  }

  draw(ctx: CanvasRenderingContext2D) {
    const from = this.producerCircuit.getProducerPinPos(this.producerPinIndex);

    const to = this.consumerCircuit.getConsumerPinPos(this.consumerPinIndex);
    if (this.producerCircuit.producerPins[this.producerPinIndex].value) {
      ctx.strokeStyle = "blue";
    } else {
      ctx.strokeStyle = "black";
    }

    ctx.lineWidth = 10 * viewManager.zoomLevel;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.closePath();
    ctx.stroke();
  }
}

export class ConsumerPin {
  static radius = 10;
  // parentCircuit: Circuit;
  value: boolean;

  constructor(readonly parentCircuit: Circuit, readonly pinIndex: number) {
    this.value = false;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const pos = this.parentCircuit.getConsumerPinPos(this.pinIndex);
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(
      pos.x,
      pos.y,
      ConsumerPin.radius * viewManager.zoomLevel,
      0,
      2 * Math.PI
    );
    if (this.value) {
      ctx.fillStyle = "red";
      ctx.fill();
    } else {
      ctx.lineWidth = 1;
      ctx.fillStyle = "white";
      ctx.fill();
      ctx.strokeStyle = "red";
      ctx.stroke();
    }
  }
}

export class ProducerPin {
  static radius = 10;
  wires: Wire[];
  value: boolean;

  constructor(
    readonly parentCircuit: Circuit,
    readonly pinIndex: number,
    value: boolean = false
  ) {
    this.wires = [];
    this.value = value;
  }

  setValue(value: boolean) {
    if (this.value === value) {
      return;
    }

    this.value = value;
    for (let i = 0; i < this.wires.length; i++) {
      this.wires[i].propogateValue(value);
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    const pos = this.parentCircuit.getProducerPinPos(this.pinIndex);
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(
      pos.x,
      pos.y,
      ConsumerPin.radius * viewManager.zoomLevel,
      0,
      2 * Math.PI
    );
    if (this.value) {
      ctx.fillStyle = "red";
      ctx.fill();
    } else {
      ctx.lineWidth = 1;
      ctx.fillStyle = "white";
      ctx.fill();
      ctx.strokeStyle = "red";
      ctx.stroke();
    }
  }
}

export type CircuitUpdateHandeler = (self: Circuit) => void;

export class Circuit {
  static width = 100;
  static pinToPinDist = 70;

  rect: Rect;

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
      scheduler.recurringEvents.push(this);
    }

    this.rect = new Rect(
      pos_x,
      pos_y,
      Circuit.width,
      this.consumerPins.length > this.producerPins.length
        ? this.consumerPins.length * 70
        : this.producerPins.length * 70
    );

    sceneManager.track(this.getVirtualObject());
  }

  getProducerPinPos(pinIndex: number) {
    const rect = this.screenRect();
    return new Vec2(
      rect.x + rect.w,
      rect.y + pinIndex * Circuit.pinToPinDist * zoomLevel
    );
  }

  getConsumerPinPos(pinIndex: number) {
    return viewManager.worldToScreen(
      new Vec2(this.rect.x, this.rect.y + pinIndex * 70)
    );
    // pos.x * zoomScale + panOffset.x,
    // pos.y * zoomScale + panOffset.y,
    // ConsumerPin.radius * zoomScale,
    // 0,
    // 2 * Math.PI
  }

  getVirtualObject() {
    return new VirtualObject(ConcreteObjectKind.Circuit, this, this.rect);
  }

  screenRect() {
    return new Rect(
      this.rect.x * viewManager.zoomLevel + viewManager.panOffset.x,
      this.rect.y * viewManager.zoomLevel + viewManager.panOffset.y,
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
