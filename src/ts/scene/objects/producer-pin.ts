import { Circle, Vec2 } from "../../math.js";
import { ConcreteObjectKind, ColliderObject } from "../scene-manager.js";
import { sceneManager, simEngine, viewManager } from "../../main.js";
import { SimEvent } from "../../engine.js";
import { Wire } from "./wire.js";
import { Circuit } from "./circuit.js";
import { PIN_EXTRUSION_WRL } from "@src/config.js";

export class ProducerPin {
  static radiusWrl = PIN_EXTRUSION_WRL / 2;
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

  getLocWrl() {
    const rect = this.parentCircuit.tightRectWrl;

    return new Vec2(
      rect.x + rect.w + ProducerPin.radiusWrl,
      rect.y + this.pinIndex * 70 + ProducerPin.radiusWrl
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
