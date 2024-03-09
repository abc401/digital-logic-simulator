import { Vec2, Circle } from "../../math.js";
import {
  ConcreteObjectKind,
  ColliderObject,
  Drawable,
} from "../scene-manager.js";
import { sceneManager, simEngine, viewManager } from "../../main.js";
import { SimEvent } from "../../engine.js";
import { ProducerPin } from "@src/scene/objects/producer-pin.js";
import { ConsumerPin } from "@src/scene/objects/consumer-pin.js";

export class Wire implements Drawable {
  fromScr: Vec2 | undefined;
  toScr: Vec2 | undefined;
  drawableId: number;

  constructor(
    private producerPin: ProducerPin | undefined,
    private consumerPin: ConsumerPin | undefined
  ) {
    console.log("[Wire Constructor]");

    this.drawableId = sceneManager.registerDrawable();
    sceneManager.drawablesBelow.set(this.drawableId, this);

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
        self.consumerPin.parentCircuit.updateHandeler
      )
    );
  }

  detach() {
    if (this.consumerPin != null) {
      this.consumerPin.value = false;
      simEngine.nextFrameEvents.enqueue(
        new SimEvent(
          this.consumerPin.parentCircuit,
          this.consumerPin.parentCircuit.updateHandeler
        )
      );
      this.consumerPin.wire = undefined;
      this.consumerPin = undefined;
    }
    if (this.producerPin != null) {
      this.producerPin.wires = this.producerPin.wires.filter((wire) => {
        return wire !== this;
      });
      this.producerPin = undefined;
    }
    sceneManager.drawablesBelow.delete(this.drawableId);
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
    const previousWire = pin.wire;
    if (previousWire != null) {
      previousWire.detach();
    }

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
        this.consumerPin.parentCircuit.updateHandeler
      )
    );
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
