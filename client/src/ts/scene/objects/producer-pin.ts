import { Circle, Vec2 } from "../../math.js";
import { ConcreteObjectKind, ColliderObject } from "../scene-manager.js";
import { sceneManager, simEngine, viewManager } from "../../main.js";
import { SimEvent, UpdationStrategy } from "../../engine.js";
import { Wire } from "./wire.js";
import { Circuit, CustomCircuitInputs } from "./circuit.js";
import {
  OFF_COLOR,
  ON_COLOR,
  PIN_EXTRUSION_WRL,
  PIN_TO_PIN_DISTANCE_WRL,
} from "@src/config.js";

export class ProducerPin {
  static radiusWrl = PIN_EXTRUSION_WRL / 2;
  wires: Wire[];
  value: boolean;
  selected = false;

  onWireAttached: (self: CustomCircuitInputs) => void = () => {};

  constructor(
    readonly parentCircuit: Circuit,
    readonly pinIndex: number,
    value: boolean = false
  ) {
    this.wires = [];
    this.value = value;
  }

  attachWire(wire: Wire) {
    this.wires.push(wire);
    this.onWireAttached(this.parentCircuit as CustomCircuitInputs);
  }

  setValue(value: boolean) {
    if (this.value === value) {
      // console.log("[producer.setValue] producer.value === new value");
      return;
    }

    this.value = value;
    for (let i = 0; i < this.wires.length; i++) {
      if (this.wires[i].updationStrategy === UpdationStrategy.Immediate) {
        this.wires[i].update(this.wires[i]);
      } else if (
        this.wires[i].updationStrategy === UpdationStrategy.InNextFrame
      ) {
        simEngine.nextFrameEvents.enqueue(
          new SimEvent(this.wires[i], this.wires[i].update)
        );
      } else {
        throw Error();
      }
    }
  }

  getLocWrl() {
    if (this.parentCircuit.sceneObject == null) {
      throw Error();
    }

    const rectWrl = this.parentCircuit.sceneObject.tightRectWrl;

    return new Vec2(
      rectWrl.x + rectWrl.w + ProducerPin.radiusWrl,
      rectWrl.y +
        (ProducerPin.radiusWrl * 2 + PIN_TO_PIN_DISTANCE_WRL) * this.pinIndex +
        ProducerPin.radiusWrl
    );
  }

  getLocScr() {
    return viewManager.worldToScreen(this.getLocWrl());
  }

  pointCollision(pointWrl: Vec2) {
    const locWrl = this.getLocWrl();
    return locWrl.sub(pointWrl).mag() < ProducerPin.radiusWrl;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const pos = this.getLocScr();
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
      ctx.fillStyle = ON_COLOR;
    } else {
      ctx.fillStyle = OFF_COLOR;
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
