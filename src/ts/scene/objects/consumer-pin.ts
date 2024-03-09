import { Circle, Vec2 } from "../../math.js";
import { ConcreteObjectKind, ColliderObject } from "../scene-manager.js";
import { sceneManager, viewManager } from "../../main.js";
import { Wire } from "./wire.js";
import { Circuit } from "./circuit.js";
import { PIN_EXTRUSION_WRL } from "@src/config.js";

export class ConsumerPin {
  static radiusWrl = PIN_EXTRUSION_WRL / 2;
  wire: Wire | undefined;
  value: boolean = false;

  constructor(readonly parentCircuit: Circuit, readonly pinIndex: number) {}

  getLocWrl() {
    const rectWrl = this.parentCircuit.tightRectWrl;
    return new Vec2(
      rectWrl.x - ConsumerPin.radiusWrl,
      rectWrl.y + this.pinIndex * 70 + ConsumerPin.radiusWrl
    );
  }

  getLocScr() {
    return viewManager.worldToScreen(this.getLocWrl());
  }

  pointCollision(pointWrl: Vec2) {
    const locWrl = this.getLocWrl();
    return locWrl.sub(pointWrl).mag() < ConsumerPin.radiusWrl;
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
