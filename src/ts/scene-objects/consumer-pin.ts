import { Circle } from "../math.js";
import { ConcreteObjectKind, VirtualObject } from "../scene-manager.js";
import { sceneManager, viewManager } from "../main.js";
import { Wire } from "./wire.js";
import { Circuit } from "./circuit.js";

export class ConsumerPin {
  static radiusWrl = 10;
  // parentCircuit: Circuit;
  wire: Wire | undefined;
  value: boolean = false;

  constructor(readonly parentCircuit: Circuit, readonly pinIndex: number) {
    sceneManager.register(this.getVirtualObject());
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
