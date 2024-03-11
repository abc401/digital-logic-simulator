import { Vec2, Rect } from "@src/math.js";
import {
  ConcreteObjectKind,
  ColliderObject,
  Drawable,
  Scene,
} from "../scene-manager.js";
import { domLog, sceneManager, simEngine, viewManager } from "@src/main.js";
import { SimEvent } from "@src/engine.js";
import { ConsumerPin } from "./consumer-pin.js";
import { ProducerPin } from "./producer-pin.js";
import { PIN_EXTRUSION_WRL, PIN_TO_PIN_DISTANCE_WRL } from "@src/config.js";

type CircuitUpdateHandeler = (self: Circuit) => void;

export interface Circuit extends Drawable {
  tightRectWrl: Rect;
  looseRectWrl: Rect;
  consumerPins: ConsumerPin[];
  producerPins: ProducerPin[];
  updateHandeler: CircuitUpdateHandeler;

  allocSimFrameToSelf: boolean;
  allocSimFrameToInputWires: boolean;

  simFrameAllocated: boolean;

  setPos(posWrl: Vec2): void;
  draw: (ctx: CanvasRenderingContext2D) => void;
  onClicked: () => void;
}

function getCircuitLooseRectWrl(tightRectWrl: Rect) {
  return new Rect(
    tightRectWrl.x - PIN_EXTRUSION_WRL,
    tightRectWrl.y - 3,
    tightRectWrl.w + 2 * PIN_EXTRUSION_WRL,
    tightRectWrl.h + 6
  );
}

function calculateCircuitRects(
  pos: Vec2,
  nConsumerPins: number,
  nProducerPins: number
) {
  const higherPinNumber =
    nConsumerPins > nProducerPins ? nConsumerPins : nProducerPins;
  const tightRectWrl = new Rect(
    pos.x,
    pos.y,
    100,
    (ConsumerPin.radiusWrl * 2 + PIN_TO_PIN_DISTANCE_WRL) *
      (higherPinNumber - 1) +
      ConsumerPin.radiusWrl * 2
  );
  const looseRectWrl = new Rect(
    tightRectWrl.x - PIN_EXTRUSION_WRL,
    tightRectWrl.y - 3,
    tightRectWrl.w + 2 * PIN_EXTRUSION_WRL,
    tightRectWrl.h + 6
  );
  return [tightRectWrl, looseRectWrl];
}

function drawCircuit(self: Circuit, ctx: CanvasRenderingContext2D) {
  const boundingRect = viewManager.worldToScreenRect(self.tightRectWrl);
  ctx.fillStyle = "cyan";
  ctx.fillRect(boundingRect.x, boundingRect.y, boundingRect.w, boundingRect.h);
  for (let i = 0; i < self.consumerPins.length; i++) {
    self.consumerPins[i].draw(ctx);
  }
  for (let i = 0; i < self.producerPins.length; i++) {
    self.producerPins[i].draw(ctx);
  }
}

export class CircuitColliderObject implements ColliderObject {
  constructor(public circuit: Circuit) {}

  looseCollisionCheck(pointWrl: Vec2) {
    const res = this.circuit.looseRectWrl.pointIntersection(pointWrl);
    if (res) {
      console.log("Loose Collision Passed");
    }
    return res;
  }

  tightCollisionCheck(pointWrl: Vec2):
    | {
        kind: ConcreteObjectKind;
        object: any;
      }
    | undefined {
    if (this.circuit.tightRectWrl.pointIntersection(pointWrl)) {
      console.log("Tight Collision Passed");
      return { kind: ConcreteObjectKind.Circuit, object: this.circuit };
    }
    for (let pin of this.circuit.consumerPins) {
      if (pin.pointCollision(pointWrl)) {
        console.log("Tight Collision Passed");
        return { kind: ConcreteObjectKind.ConsumerPin, object: pin };
      }
    }
    for (let pin of this.circuit.producerPins) {
      if (pin.pointCollision(pointWrl)) {
        console.log("Tight Collision Passed");
        return { kind: ConcreteObjectKind.ProducerPin, object: pin };
      }
    }
    return undefined;
  }
}

export class InputCircuit implements Circuit {
  allocSimFrameToSelf = true;
  allocSimFrameToInputWires = true;
  simFrameAllocated = false;

  tightRectWrl: Rect;
  looseRectWrl: Rect;

  consumerPins: ConsumerPin[];
  producerPins: ProducerPin[];

  constructor(public value: boolean, pos_x: number, pos_y: number) {
    [this.tightRectWrl, this.looseRectWrl] = calculateCircuitRects(
      new Vec2(pos_x, pos_y),
      0,
      1
    );

    this.consumerPins = new Array();

    this.producerPins = Array(1);
    for (let i = 0; i < this.producerPins.length; i++) {
      this.producerPins[i] = new ProducerPin(this, i);
    }

    this.updateHandeler(this);

    simEngine.recurringEvents.push(new SimEvent(this, this.updateHandeler));

    sceneManager.registerCollider(new CircuitColliderObject(this));
    const drawableId = sceneManager.registerDrawable();
    sceneManager.currentScene.drawablesAbove.set(drawableId, this);
  }

  setPos(posWrl: Vec2) {
    this.tightRectWrl.xy = posWrl;
    this.looseRectWrl = getCircuitLooseRectWrl(this.tightRectWrl);
  }

  updateHandeler(self_: Circuit) {
    let self = self_ as InputCircuit;
    self.producerPins[0].setValue(self.value);
    self.simFrameAllocated = false;
  }

  onClicked() {
    this.value = !this.value;
    this.producerPins[0].setValue(this.value);
  }

  // prodPinLocWrl(pinIndex: number) {
  //   return new Vec2(
  //     this.rectWrl.x + this.rectWrl.w,
  //     this.rectWrl.y + pinIndex * Circuit.pinToPinDist
  //   );
  // }

  // prodPinLocScr(pinIndex: number) {
  //   const rect = this.screenRect();
  //   return new Vec2(
  //     rect.x + rect.w,
  //     rect.y + pinIndex * Circuit.pinToPinDist * viewManager.zoomLevel
  //   );
  // }

  // conPinLocScr(pinIndex: number) {
  //   return viewManager.worldToScreen(
  //     new Vec2(this.rectWrl.x, this.rectWrl.y + pinIndex * 70)
  //   );
  //   // pos.x * zoomScale + panOffset.x,
  //   // pos.y * zoomScale + panOffset.y,
  //   // ConsumerPin.radius * zoomScale,
  //   // 0,
  //   // 2 * Math.PI
  // }

  // getVirtualObject() {
  //   return new VirtualObject(ConcreteObjectKind.Circuit, this, this.rectWrl);
  // }

  // screenRect() {
  //   return new Rect(
  //     this.rectWrl.x * viewManager.zoomLevel + viewManager.panOffset.x,
  //     this.rectWrl.y * viewManager.zoomLevel + viewManager.panOffset.y,
  //     Circuit.width * viewManager.zoomLevel,
  //     (this.consumerPins.length > this.producerPins.length
  //       ? this.consumerPins.length * 70
  //       : this.producerPins.length * 70) * viewManager.zoomLevel
  //   );
  // }

  draw(ctx: CanvasRenderingContext2D) {
    drawCircuit(this, ctx);
  }
}

export class ProcessingCircuit implements Circuit {
  simFrameAllocated = false;

  allocSimFrameToInputWires = true;
  allocSimFrameToSelf = true;

  updateHandeler: CircuitUpdateHandeler;

  tightRectWrl: Rect;
  looseRectWrl: Rect;

  consumerPins: ConsumerPin[];
  producerPins: ProducerPin[];
  onClicked = () => {};

  constructor(
    nConsumerPins: number,
    nProducerPins: number,
    updateHandeler: CircuitUpdateHandeler,
    pos_x: number,
    pos_y: number
  ) {
    [this.tightRectWrl, this.looseRectWrl] = calculateCircuitRects(
      new Vec2(pos_x, pos_y),
      nConsumerPins,
      nProducerPins
    );

    this.producerPins = new Array(nProducerPins);
    for (let i = 0; i < nProducerPins; i++) {
      this.producerPins[i] = new ProducerPin(this, i);
    }

    this.consumerPins = new Array(nConsumerPins);
    for (let i = 0; i < nConsumerPins; i++) {
      this.consumerPins[i] = new ConsumerPin(this, i);
    }

    this.updateHandeler = (self) => {
      updateHandeler(self);
      self.simFrameAllocated = false;
    };

    this.updateHandeler(this);

    sceneManager.registerCollider(
      // new ColliderObject(ConcreteObjectKind.Circuit, this, this.rectWrl)
      new CircuitColliderObject(this)
    );
    const drawableId = sceneManager.registerDrawable();
    sceneManager.currentScene.drawablesAbove.set(drawableId, this);
  }

  setPos(posWrl: Vec2) {
    this.tightRectWrl.xy = posWrl;
    this.looseRectWrl = getCircuitLooseRectWrl(this.tightRectWrl);
  }

  draw(ctx: CanvasRenderingContext2D) {
    drawCircuit(this, ctx);
  }
}

export class CustomCircuitInputs implements Circuit {
  simFrameAllocated = false;

  allocSimFrameToInputWires = false;
  allocSimFrameToSelf = false;

  tightRectWrl: Rect;
  looseRectWrl: Rect;

  consumerPins: ConsumerPin[];
  producerPins: ProducerPin[];

  updateHandeler = () => {};

  constructor(pos_x: number, pos_y: number) {
    [this.tightRectWrl, this.looseRectWrl] = calculateCircuitRects(
      new Vec2(pos_x, pos_y),
      0,
      1
    );

    this.consumerPins = new Array();

    this.producerPins = Array(1);

    for (let i = 0; i < this.producerPins.length; i++) {
      this.producerPins[i] = new ProducerPin(this, i);
    }

    let producerPin = this.producerPins[0];
    producerPin.onWireAttached = CustomCircuitInputs.addPin;
    // simEngine.recurringEvents.push(new SimEvent(this, this.updateHandeler));

    if (sceneManager.currentScene.customCircuitIO == null) {
      return;
    }
    if (sceneManager.currentScene.customCircuitIO.i != null) {
      return;
    }

    sceneManager.currentScene.customCircuitIO.i = this;

    sceneManager.registerCollider(new CircuitColliderObject(this));
    const drawableId = sceneManager.registerDrawable();
    sceneManager.currentScene.drawablesAbove.set(drawableId, this);
  }

  setPos(posWrl: Vec2) {
    this.tightRectWrl.xy = posWrl;
    this.looseRectWrl = getCircuitLooseRectWrl(this.tightRectWrl);
  }

  setValues(pins: ConsumerPin[]) {
    for (let i = 0; i < this.producerPins.length - 1; i++) {
      // this.producerPins[i].setValue(pins[i].value);
      this.producerPins[i].value = pins[i].value;
      for (let wire of this.producerPins[i].wires) {
        wire.update(wire);
      }
    }
  }

  static addPin(self: CustomCircuitInputs) {
    const newPinIndex = self.producerPins.length;
    let currentLastPin = self.producerPins[newPinIndex - 1];
    currentLastPin.onWireAttached = () => {};
    let newPin = new ProducerPin(self, newPinIndex);
    newPin.onWireAttached = CustomCircuitInputs.addPin;
    self.producerPins.push(newPin);

    [self.tightRectWrl, self.looseRectWrl] = calculateCircuitRects(
      self.tightRectWrl.xy,
      0,
      self.producerPins.length
    );
    // console.log("Adding Pin");
    // console.log("New pin: ", newPin);
    // console.log("All pins: ", self.producerPins);
  }

  onClicked() {}

  draw(ctx: CanvasRenderingContext2D) {
    drawCircuit(this, ctx);
  }
}

export class CustomCircuitOutputs implements Circuit {
  allocSimFrameToSelf = false;
  allocSimFrameToInputWires = false;

  simFrameAllocated = false;

  tightRectWrl: Rect;
  looseRectWrl: Rect;

  consumerPins: ConsumerPin[];
  producerPins: ProducerPin[];

  customCircuitProducerPins: ProducerPin[] | undefined;

  constructor(pos_x: number, pos_y: number) {
    const nConsumerPins = 1;
    const nProducerPins = 0;

    [this.tightRectWrl, this.looseRectWrl] = calculateCircuitRects(
      new Vec2(pos_x, pos_y),
      nConsumerPins,
      nProducerPins
    );

    this.consumerPins = new Array(nConsumerPins);

    this.producerPins = Array(nProducerPins);

    for (let i = 0; i < this.consumerPins.length; i++) {
      this.consumerPins[i] = new ConsumerPin(this, i);
    }

    let consumerPin = this.consumerPins[0];
    consumerPin.onWireAttached = CustomCircuitOutputs.addPin;
    // simEngine.recurringEvents.push(new SimEvent(this, this.updateHandeler));

    if (sceneManager.currentScene.customCircuitIO == null) {
      return;
    }
    if (sceneManager.currentScene.customCircuitIO.o != null) {
      return;
    }

    sceneManager.currentScene.customCircuitIO.o = this;

    sceneManager.registerCollider(new CircuitColliderObject(this));
    const drawableId = sceneManager.registerDrawable();
    sceneManager.currentScene.drawablesAbove.set(drawableId, this);
  }

  setPos(posWrl: Vec2) {
    this.tightRectWrl.xy = posWrl;
    this.looseRectWrl = getCircuitLooseRectWrl(this.tightRectWrl);
  }

  updateHandeler(self: Circuit) {
    let circuit = self as CustomCircuitOutputs;
    if (circuit.customCircuitProducerPins == null) {
      console.log("circuit.customCircuitProducerPins == null");
      return;
    }
    for (let i = 0; i < circuit.consumerPins.length - 1; i++) {
      circuit.customCircuitProducerPins[i].setValue(
        circuit.consumerPins[i].value
      );
    }
  }

  static addPin(self: CustomCircuitOutputs) {
    const newPinIndex = self.consumerPins.length;
    let currentLastPin = self.consumerPins[newPinIndex - 1];
    currentLastPin.onWireAttached = () => {};

    let newPin = new ConsumerPin(self, newPinIndex);
    newPin.onWireAttached = CustomCircuitOutputs.addPin;
    self.consumerPins.push(newPin);

    [self.tightRectWrl, self.looseRectWrl] = calculateCircuitRects(
      self.tightRectWrl.xy,
      self.consumerPins.length,
      0
    );
    // console.log("Adding Pin");
    // console.log("New pin: ", newPin);
    // console.log("All pins: ", self.producerPins);
  }

  onClicked() {}

  draw(ctx: CanvasRenderingContext2D) {
    drawCircuit(this, ctx);
  }
}

export class CustomCircuit implements Circuit {
  allocSimFrameToSelf = false;
  allocSimFrameToInputWires = true;

  simFrameAllocated = false;

  tightRectWrl: Rect;
  looseRectWrl: Rect;

  consumerPins: ConsumerPin[];
  producerPins: ProducerPin[];

  scene: Scene;
  onClicked = () => {};

  constructor(
    sceneId: number,

    pos_x: number,
    pos_y: number
  ) {
    console.log("SceneId: ", sceneId);
    const scene = sceneManager.scenes.get(sceneId);
    if (
      scene == null ||
      scene.customCircuitIO == null ||
      scene.customCircuitIO.i == null ||
      scene.customCircuitIO.o == null
    ) {
      domLog(
        "[CustomCircuit] scene == null || scene.customCircuitIO == null || scene.customCircuitIO.i == null  || scene.customCircuitIO.o == null"
      );
      throw Error();
    }
    this.scene = scene;

    const customInputs = scene.customCircuitIO.i;
    const customOutputs = scene.customCircuitIO.o;

    const nConsumerPins = customInputs.producerPins.length - 1;
    const nProducerPins = customOutputs.consumerPins.length - 1;

    {
      [this.tightRectWrl, this.looseRectWrl] = calculateCircuitRects(
        new Vec2(pos_x, pos_y),
        nConsumerPins,
        nProducerPins
      );
    }

    this.producerPins = new Array(nProducerPins);
    for (let i = 0; i < nProducerPins; i++) {
      this.producerPins[i] = new ProducerPin(this, i);
    }

    this.consumerPins = new Array(nConsumerPins);
    for (let i = 0; i < nConsumerPins; i++) {
      this.consumerPins[i] = new ConsumerPin(this, i);
    }

    customOutputs.customCircuitProducerPins = this.producerPins;

    // this.updateHandeler(this);

    sceneManager.registerCollider(new CircuitColliderObject(this));
    const drawableId = sceneManager.registerDrawable();
    sceneManager.currentScene.drawablesAbove.set(drawableId, this);
  }

  updateHandeler(self: Circuit) {
    let circuit = self as CustomCircuit;
    if (
      circuit.scene == null ||
      circuit.scene.customCircuitIO == null ||
      circuit.scene.customCircuitIO.i == null ||
      circuit.scene.customCircuitIO.o == null
    ) {
      domLog(
        "[CustomCircuit] scene == null || scene.customCircuitIO == null || scene.customCircuitIO.i == null  || scene.customCircuitIO.o == null"
      );
      throw Error();
    }
    let customInputs = circuit.scene.customCircuitIO.i;
    customInputs.setValues(circuit.consumerPins);
  }

  setPos(posWrl: Vec2) {
    this.tightRectWrl.xy = posWrl;
    this.looseRectWrl = getCircuitLooseRectWrl(this.tightRectWrl);
  }

  draw(ctx: CanvasRenderingContext2D) {
    drawCircuit(this, ctx);
  }
}
