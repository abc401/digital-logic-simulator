import { Vec2, Rect } from "./math.js";
import { Scheduler } from "./scheduler.js";
import { zoomScale, panOffset, worldToScreen } from "./canvas.js";

export class Wire {
  constructor(
    readonly producerCircuit: Circuit,
    readonly producerPinIndex: number,
    readonly consumerCircuit: Circuit,
    readonly consumerPinIndex: number,
    readonly scheduler: Scheduler
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

    this.scheduler.nextFrameEvents.enqueue(this.consumerCircuit);
  }

  draw(ctx: CanvasRenderingContext2D) {
    const from = this.producerCircuit.getProducerPinPos(this.producerPinIndex);

    const to = this.consumerCircuit.getConsumerPinPos(this.consumerPinIndex);
    if (this.producerCircuit.producerPins[this.producerPinIndex].value) {
      ctx.strokeStyle = "blue";
    } else {
      ctx.strokeStyle = "black";
    }
    ctx.lineWidth = 10 * zoomScale;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.closePath();
    ctx.stroke();
  }
}

class ConsumerPin {
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
    ctx.arc(pos.x, pos.y, ConsumerPin.radius * zoomScale, 0, 2 * Math.PI);
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

class ProducerPin {
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
    ctx.arc(pos.x, pos.y, ConsumerPin.radius * zoomScale, 0, 2 * Math.PI);
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

type CircuitUpdateHandeler = (self: Circuit) => void;

export class Circuit {
  static width = 100;
  static pinToPinDist = 70;

  public pos: Vec2;

  isBeingHovered = false;

  consumerPins: ConsumerPin[];
  producerPins: ProducerPin[];

  update: CircuitUpdateHandeler;
  // scheduler: Scheduler;

  constructor(
    nConsumerPins: number,
    nProducerPins: number,
    readonly scheduler: Scheduler,
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
    this.pos = new Vec2(pos_x, pos_y);
    this.update = update;
    this.update(this);

    if (isInput) {
      scheduler.recurringEvents.push(this);
    }
  }

  getProducerPinPos(pinIndex: number) {
    const rect = this.screenRect();
    return new Vec2(
      rect.x + rect.width,
      rect.y + pinIndex * Circuit.pinToPinDist * zoomScale
    );
  }

  getConsumerPinPos(pinIndex: number) {
    return worldToScreen(new Vec2(this.pos.x, this.pos.y + pinIndex * 70));
    // pos.x * zoomScale + panOffset.x,
    // pos.y * zoomScale + panOffset.y,
    // ConsumerPin.radius * zoomScale,
    // 0,
    // 2 * Math.PI
  }

  screenRect() {
    return new Rect(
      this.pos.x * zoomScale + panOffset.x,
      this.pos.y * zoomScale + panOffset.y,
      Circuit.width * zoomScale,
      (this.consumerPins.length > this.producerPins.length
        ? this.consumerPins.length * 70
        : this.producerPins.length * 70) * zoomScale
    );
  }
  worldRect() {
    return new Rect(
      this.pos.x,
      this.pos.y,
      Circuit.width,
      this.consumerPins.length > this.producerPins.length
        ? this.consumerPins.length * 70
        : this.producerPins.length * 70
    );
  }

  setPos(point: Vec2) {
    this.pos = point;
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
      boundingRect.width,
      boundingRect.height
    );
    if (this.isBeingHovered) {
      ctx.strokeStyle = "black";
      ctx.lineWidth = 1;
      ctx.strokeRect(
        boundingRect.x,
        boundingRect.y,
        boundingRect.width,
        boundingRect.height
      );
    }
  }
}
