import { Vec2, Circle } from "@src/math.js";
import {
  ConcreteObjectKind,
  ColliderObject,
  Drawable,
} from "../scene-manager.js";
import { sceneManager, simEngine, viewManager } from "@src/main.js";
import { SimEvent } from "@src/engine.js";
import { ProducerPin } from "@src/scene/objects/producer-pin.js";
import { ConsumerPin } from "@src/scene/objects/consumer-pin.js";

export class Wire implements Drawable {
  fromScr: Vec2 | undefined;
  toScr: Vec2 | undefined;
  drawableId: number;
  allocateSimFrame: boolean = true;

  constructor(
    private producerPin: ProducerPin | undefined,
    private consumerPin: ConsumerPin | undefined
  ) {
    console.log("[Wire Constructor]");

    this.drawableId = sceneManager.registerDrawable();
    sceneManager.currentScene.drawablesBelow.set(this.drawableId, this);

    if (producerPin != null) {
      producerPin.attachWire(this);
      this.setProducerPin(producerPin);
      // if (!producerPin.parentCircuit.allocateSimFrame) {
      //   this.allocateSimFrame = false;
      // }
    }

    if (consumerPin != null) {
      consumerPin.attachWire(this);
      this.setConsumerPin(consumerPin);
      // if (!consumerPin.parentCircuit.allocateSimFrame) {
      //   this.allocateSimFrame = false;
      // }
    }

    if (producerPin == null || consumerPin == null) {
      console.log(
        "[Wire Constructor] producerPin == null || consumerPin == null"
      );
      return;
    }

    this.update(this);
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

    if (self.consumerPin.parentCircuit.simFrameAllocated) {
      return;
    }

    self.consumerPin.value = self.producerPin.value;
    if (!self.consumerPin.parentCircuit.allocSimFrameToSelf) {
      self.consumerPin.parentCircuit.updateHandeler(
        self.consumerPin.parentCircuit
      );
      return;
    }

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
    sceneManager.currentScene.drawablesBelow.delete(this.drawableId);
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
    pin.attachWire(this);

    if (!pin.parentCircuit.allocSimFrameToSelf) {
      this.allocateSimFrame = false;
    }

    console.log("Producer", pin.parentCircuit);
    if (this.consumerPin == null) {
      return;
    }
    console.log("propogated Value");
    this.update(this);
  }

  getConsumerPin() {
    return this.consumerPin;
  }

  setConsumerPin(pin: ConsumerPin) {
    pin.attachWire(this);
    this.consumerPin = pin;

    if (!pin.parentCircuit.allocSimFrameToInputWires) {
      this.allocateSimFrame = false;
    }

    console.log("Consumer: ", pin.parentCircuit);
    if (this.producerPin == null) {
      return;
    }

    console.log("Propogated Value");
    this.update(this);
  }

  // propogateValue(value: boolean) {
  //   if (this.consumerPin == null) {
  //     console.log("Consumer was null");
  //     return;
  //   }

  //   if (value === this.consumerPin.value) {
  //     console.log("produced === consumed");
  //     return;
  //   }
  //   this.consumerPin.value = value;

  //   console.log("Enqueued");
  //   simEngine.nextFrameEvents.enqueue(
  //     new SimEvent(
  //       this.consumerPin.parentCircuit,
  //       this.consumerPin.parentCircuit.updateHandeler
  //     )
  //   );
  // }

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