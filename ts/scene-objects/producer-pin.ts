import { Circle } from "../math.js";
import { ConcreteObjectKind, VirtualObject } from "../scene-manager.js";
import { sceneManager, simEngine, viewManager } from "../main.js";
import { SimEvent } from "../engine.js";
import { Wire } from "./wire.js";
import { Circuit } from "./circuit.js";

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
    sceneManager.register(this.getVirtualObject());
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
