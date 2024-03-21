import { Circle, Vec2 } from "../../math.js";
import { ConcreteObjectKind, ColliderObject } from "../scene-manager.js";
import { sceneManager, viewManager } from "../../main.js";
import { Wire } from "./wire.js";
import { Circuit, CustomCircuitOutputs } from "./circuit.js";
import {
  OFF_COLOR,
  ON_COLOR,
  PIN_EXTRUSION_WRL,
  PIN_TO_PIN_DISTANCE_WRL,
} from "@src/config.js";

export class ConsumerPin {
  static radiusWrl = PIN_EXTRUSION_WRL / 2;

  wire: Wire | undefined;
  // value: boolean = false;

  onWireAttached: (self: CustomCircuitOutputs) => void = () => {};

  constructor(
    readonly parentCircuit: Circuit,
    readonly pinIndex: number,
    public value = false
  ) {}

  getLocWrl() {
    if (this.parentCircuit.sceneObject == null) {
      throw Error();
    }

    const rectWrl = this.parentCircuit.sceneObject.tightRectWrl;
    return new Vec2(
      rectWrl.x - ConsumerPin.radiusWrl,
      rectWrl.y +
        (ConsumerPin.radiusWrl * 2 + PIN_TO_PIN_DISTANCE_WRL) * this.pinIndex +
        ConsumerPin.radiusWrl
    );
  }

  getLocScr() {
    return viewManager.worldToScreen(this.getLocWrl());
  }

  attachWire(wire: Wire) {
    if (this.wire != null) {
      this.wire.detach();
    }

    this.wire = wire;
    this.onWireAttached(this.parentCircuit as CustomCircuitOutputs);
  }

  pointCollision(pointWrl: Vec2) {
    const locWrl = this.getLocWrl();
    return locWrl.sub(pointWrl).mag() < ConsumerPin.radiusWrl;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const pos = this.getLocScr();
    ctx.beginPath();
    ctx.arc(
      pos.x,
      pos.y,
      ConsumerPin.radiusWrl * viewManager.zoomLevel,
      0,
      2 * Math.PI
    );
    if (this.value) {
      ctx.fillStyle = ON_COLOR;
      ctx.fill();
    } else {
      ctx.lineWidth = 1;
      ctx.fillStyle = OFF_COLOR;
      ctx.fill();
      ctx.strokeStyle = "red";
      ctx.stroke();
    }
  }
}
