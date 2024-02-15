import { Vec2, Rect, Circle } from "./math.js";
import { zoomLevel, panOffset, worldToScreen } from "./canvas.js";
import { ConcreteObjectKind, VirtualObject } from "./scene-manager.js";
import { domLog, sceneManager, simEngine, viewManager, wires } from "./main.js";
import { SimEvent } from "./engine.js";

export class Wire {
  fromScr: Vec2 | undefined;
  toScr: Vec2 | undefined;

  constructor(
    private producerPin: ProducerPin | undefined,
    private consumerPin: ConsumerPin | undefined
  ) {
    wires.push(this);
    console.log("[Wire Constructor]");

    if (producerPin != null) {
      producerPin.wires.push(this);
    }

    if (consumerPin != null) {
      consumerPin.wire = this;
    }

    if (producerPin == null || consumerPin == null) {
      console.log(
        "[Wire Constructor] producerPin == null || consumerPin == null"
      );
      return;
    }

    this.propogateValue(producerPin.value);
  }

  update(self: Wire) {
    if (self.consumerPin == null) {
      console.log("Consumer == null");
    }
    if (self.producerPin == null) {
      console.log("Producer == null");
    }
    if (self.consumerPin == null || self.producerPin == null) {
      return;
    }

    self.consumerPin.value = self.producerPin.value;
    simEngine.nextFrameEvents.enqueue(
      new SimEvent(
        self.consumerPin.parentCircuit,
        self.consumerPin.parentCircuit.update
      )
    );
  }

  detach() {
    if (this.consumerPin != null) {
      this.consumerPin.wire = undefined;
      this.consumerPin = undefined;
    }
    if (this.producerPin != null) {
      this.producerPin.wires = this.producerPin.wires.filter((wire) => {
        return wire !== this;
      });
      this.producerPin = undefined;
    }
  }

  isConsumerPinNull() {
    return this.consumerPin == null;
  }

  isProducerPinNull() {
    return this.producerPin == null;
  }

  getProducerPin() {
    return this.producerPin;
  }

  setProducerPin(pin: ProducerPin) {
    this.producerPin = pin;
    pin.wires.push(this);
    console.log("Producer", pin.parentCircuit);
    if (this.consumerPin == null) {
      return;
    }
    console.log("propogated Value");
    this.propogateValue(this.producerPin.value);
  }

  getConsumerPin() {
    return this.consumerPin;
  }

  setConsumerPin(pin: ConsumerPin) {
    pin.wire = this;
    this.consumerPin = pin;
    console.log("Consumer: ", pin.parentCircuit);
    if (this.producerPin == null) {
      return;
    }
    console.log("Propogated Value");
    this.propogateValue(this.producerPin.value);
  }

  propogateValue(value: boolean) {
    if (this.consumerPin == null) {
      console.log("Consumer was null");
      return;
    }

    if (value === this.consumerPin.value) {
      console.log("produced === consumed");
      return;
    }
    this.consumerPin.value = value;

    console.log("Enqueued");
    simEngine.nextFrameEvents.enqueue(
      new SimEvent(
        this.consumerPin.parentCircuit,
        this.consumerPin.parentCircuit.update
      )
    );
    // this.consumerPin.parentCircuit);
  }

  draw(ctx: CanvasRenderingContext2D) {
    const from =
      this.producerPin == null ? this.fromScr : this.producerPin.getLocScr();
    const to =
      this.consumerPin == null ? this.toScr : this.consumerPin.getLocScr();

    if (from == null || to == null) {
      return;
    }

    if (this.consumerPin && this.consumerPin.value) {
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
  static radiusWrl = 10;
  // parentCircuit: Circuit;
  wire: Wire | undefined;
  value: boolean = false;

  constructor(readonly parentCircuit: Circuit, readonly pinIndex: number) {
    sceneManager.track(this.getVirtualObject());
  }

  getVirtualObject() {
    return new VirtualObject(
      ConcreteObjectKind.ConsumerPin,
      this,
      new Circle(
        () => viewManager.screenToWorld(this.getLocScr()),
        ConsumerPin.radiusWrl
      )
    );
  }

  getLocScr() {
    return this.parentCircuit.conPinLocScr(this.pinIndex);
  }

  draw(ctx: CanvasRenderingContext2D) {
    const pos = this.getLocScr();
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(
      pos.x,
      pos.y,
      ConsumerPin.radiusWrl * viewManager.zoomLevel,
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
  static radiusWrl = 10;
  wires: Wire[];
  value: boolean;
  selected = false;

  constructor(
    readonly parentCircuit: Circuit,
    readonly pinIndex: number,
    value: boolean = false
  ) {
    this.wires = [];
    this.value = value;
    sceneManager.track(this.getVirtualObject());
  }

  setValue(value: boolean) {
    if (this.value === value) {
      // console.log("[producer.setValue] producer.value === new value");
      return;
    }

    this.value = value;
    for (let i = 0; i < this.wires.length; i++) {
      simEngine.nextFrameEvents.enqueue(
        new SimEvent(this.wires[i], this.wires[i].update)
      );
      // this.wires[i].propogateValue(value);
    }
  }

  getLocScr() {
    return this.parentCircuit.prodPinLocScr(this.pinIndex);
  }

  getVirtualObject() {
    return new VirtualObject(
      ConcreteObjectKind.ProducerPin,
      this,
      new Circle(
        () => viewManager.screenToWorld(this.getLocScr()),
        ProducerPin.radiusWrl
      )
    );
  }

  draw(ctx: CanvasRenderingContext2D) {
    const pos = this.getLocScr();
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(
      pos.x,
      pos.y,
      ProducerPin.radiusWrl * viewManager.zoomLevel,
      0,
      2 * Math.PI
    );
    ctx.closePath();
    ctx.lineWidth = 1;
    if (this.value) {
      ctx.fillStyle = "red";
    } else {
      ctx.fillStyle = "white";
      ctx.strokeStyle = "red";
      ctx.stroke();
    }
    if (this.selected) {
      ctx.strokeStyle = "green";
      ctx.stroke();
    }
    ctx.fill();
  }
}

export type CircuitUpdateHandeler = (self: Circuit) => void;

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

    sceneManager.track(this.getVirtualObject());
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
      rect.y + pinIndex * Circuit.pinToPinDist * zoomLevel
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
