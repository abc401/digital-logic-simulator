import { Vec2, Rect } from "@src/math.js";
import {
  ConcreteObjectKind,
  ColliderObject,
  Scene,
  SceneObject,
} from "../scene-manager.js";
import { domLog, sceneManager, simEngine, viewManager } from "@src/main.js";
import { SimEvent } from "@src/engine.js";
import { ConsumerPin } from "./consumer-pin.js";
import { ProducerPin } from "./producer-pin.js";
import { PIN_EXTRUSION_WRL, PIN_TO_PIN_DISTANCE_WRL } from "@src/config.js";
import { Queue } from "@src/queue.js";
import { Wire } from "./wire.js";
import { cloneGraphAfterCircuit } from "@src/interactivity/common.js";

type CircuitUpdateHandeler = (self: Circuit) => void;

export interface Circuit {
  consumerPins: ConsumerPin[];
  producerPins: ProducerPin[];
  updateHandeler: CircuitUpdateHandeler;

  allocSimFrameToSelf: boolean;
  allocSimFrameToInputWires: boolean;
  allocSimFrameToOutputWires: boolean;

  simFrameAllocated: boolean;

  sceneObject: CircuitSceneObject | undefined;

  clone(): Circuit;
  configSceneObject(pos: Vec2): void;
}

export class CircuitSceneObject {
  id: number;
  parentScene: number;

  tightRectWrl: Rect;
  looseRectWrl: Rect;

  isSelected = false;

  onClicked: ((self: Circuit) => void) | undefined = undefined;

  constructor(public parentCircuit: Circuit, pos: Vec2) {
    this.tightRectWrl = this.calcTightRect(pos);
    this.looseRectWrl = this.calcLooseRect(this.tightRectWrl);

    this.parentScene = sceneManager.currentSceneId;
    this.id = sceneManager.currentScene.registerCircuit(this);
  }

  private calcTightRect(pos: Vec2) {
    const nConsumerPins = this.parentCircuit.consumerPins.length;
    const nProducerPins = this.parentCircuit.producerPins.length;

    const higherPinNumber =
      nConsumerPins > nProducerPins ? nConsumerPins : nProducerPins;

    return new Rect(
      pos.x,
      pos.y,
      100,
      (ConsumerPin.radiusWrl * 2 + PIN_TO_PIN_DISTANCE_WRL) *
        (higherPinNumber - 1) +
        ConsumerPin.radiusWrl * 2
    );
  }

  private calcLooseRect(tightRect: Rect) {
    return new Rect(
      tightRect.x - PIN_EXTRUSION_WRL,
      tightRect.y - 3,
      tightRect.w + 2 * PIN_EXTRUSION_WRL,
      tightRect.h + 6
    );
  }

  calcRects() {
    const pos = this.tightRectWrl.xy;

    this.tightRectWrl = this.calcTightRect(pos);
    this.looseRectWrl = this.calcLooseRect(this.tightRectWrl);
  }

  setPos(posWrl: Vec2) {
    this.tightRectWrl.xy = posWrl;
    this.looseRectWrl = this.calcLooseRect(this.tightRectWrl);
  }

  draw(ctx: CanvasRenderingContext2D) {
    const tightRectScr = viewManager.worldToScreenRect(this.tightRectWrl);
    ctx.fillStyle = "cyan";
    ctx.fillRect(
      tightRectScr.x,
      tightRectScr.y,
      tightRectScr.w,
      tightRectScr.h
    );
    for (let i = 0; i < this.parentCircuit.consumerPins.length; i++) {
      this.parentCircuit.consumerPins[i].draw(ctx);
    }
    for (let i = 0; i < this.parentCircuit.producerPins.length; i++) {
      this.parentCircuit.producerPins[i].draw(ctx);
    }

    if (this.isSelected) {
      const looseRectScr = viewManager.worldToScreenRect(this.looseRectWrl);
      ctx.strokeStyle = "green";
      ctx.strokeRect(
        looseRectScr.x,
        looseRectScr.y,
        looseRectScr.w,
        looseRectScr.h
      );
    }
  }
}

export class CircuitColliderObject implements ColliderObject {
  constructor(public circuit: Circuit) {}

  looseCollisionCheck(pointWrl: Vec2) {
    if (this.circuit.sceneObject == null) {
      throw Error();
    }
    const res =
      this.circuit.sceneObject.looseRectWrl.pointIntersection(pointWrl);
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
    if (this.circuit.sceneObject == null) {
      throw Error();
    }

    if (this.circuit.sceneObject.tightRectWrl.pointIntersection(pointWrl)) {
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

function circuitCloneHelper(circuit: Circuit) {
  const cloned = Object.assign({}, circuit);
  Object.setPrototypeOf(cloned, Object.getPrototypeOf(circuit));

  cloned.producerPins = new Array(circuit.producerPins.length);
  cloned.consumerPins = new Array(circuit.consumerPins.length);
  cloned.sceneObject = undefined;

  for (let i = 0; i < circuit.producerPins.length; i++) {
    cloned.producerPins[i] = new ProducerPin(
      cloned,
      i,
      circuit.producerPins[i].value
    );
  }
  for (let i = 0; i < circuit.consumerPins.length; i++) {
    cloned.consumerPins[i] = new ConsumerPin(
      cloned,
      i,
      circuit.consumerPins[i].value
    );
  }
  console.log("[circuitCloneHelper] circuit: ", circuit);
  console.log("[circuitCloneHelper] cloned: ", cloned);
  return cloned;
}

export class InputCircuit implements Circuit {
  allocSimFrameToSelf = true;
  allocSimFrameToInputWires = true;
  allocSimFrameToOutputWires = true;

  simFrameAllocated = false;

  consumerPins: ConsumerPin[];
  producerPins: ProducerPin[];

  sceneObject: CircuitSceneObject | undefined;

  constructor(public value: boolean) {
    this.sceneObject = undefined;

    this.consumerPins = new Array();

    this.producerPins = Array(1);
    for (let i = 0; i < this.producerPins.length; i++) {
      this.producerPins[i] = new ProducerPin(this, i);
    }

    this.updateHandeler(this);

    simEngine.recurringEvents.push(new SimEvent(this, this.updateHandeler));
  }

  updateHandeler(self_: Circuit) {
    let self = self_ as InputCircuit;
    self.producerPins[0].setValue(self.value);
    self.simFrameAllocated = false;
  }

  clone(): Circuit {
    return circuitCloneHelper(this);
  }

  configSceneObject(pos: Vec2): void {
    this.sceneObject = new CircuitSceneObject(this, pos);
  }

  static onClicked(self_: Circuit) {
    let self = self_ as InputCircuit;
    self.value = !self.value;
    self.producerPins[0].setValue(self.value);
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
}

export class ProcessingCircuit implements Circuit {
  simFrameAllocated = false;

  allocSimFrameToSelf = true;

  allocSimFrameToInputWires = true;
  allocSimFrameToOutputWires = true;

  updateHandeler: CircuitUpdateHandeler;

  consumerPins: ConsumerPin[];
  producerPins: ProducerPin[];

  sceneObject: CircuitSceneObject | undefined;

  constructor(
    nConsumerPins: number,
    nProducerPins: number,
    updateHandeler: CircuitUpdateHandeler
  ) {
    this.sceneObject = undefined;

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
  }
  configSceneObject(pos: Vec2): void {
    this.sceneObject = new CircuitSceneObject(this, pos);
  }

  clone(): Circuit {
    return circuitCloneHelper(this);
  }
}

export class CustomCircuitInputs implements Circuit {
  simFrameAllocated = false;

  allocSimFrameToInputWires = false;
  allocSimFrameToOutputWires = false;
  allocSimFrameToSelf = false;

  consumerPins: ConsumerPin[];
  producerPins: ProducerPin[];

  sceneObject: CircuitSceneObject | undefined;

  updateHandeler = () => {};

  constructor() {
    this.sceneObject = undefined;

    this.consumerPins = new Array();

    this.producerPins = Array(1);

    for (let i = 0; i < this.producerPins.length; i++) {
      this.producerPins[i] = new ProducerPin(this, i);
    }

    let producerPin = this.producerPins[0];
    producerPin.onWireAttached = CustomCircuitInputs.addPin;
  }

  clone(): Circuit {
    return circuitCloneHelper(this);
  }

  configSceneObject(pos: Vec2): void {
    if (sceneManager.currentScene.customCircuitInputs != null) {
      throw Error();
    }

    this.sceneObject = new CircuitSceneObject(this, pos);
    sceneManager.currentScene.customCircuitInputs = this.sceneObject.id;
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

    if (self.sceneObject != null) {
      self.sceneObject.calcRects();
    }

    // console.log("Adding Pin");
    // console.log("New pin: ", newPin);
    // console.log("All pins: ", self.producerPins);
  }
}

export class CustomCircuitOutputs implements Circuit {
  allocSimFrameToSelf = false;
  allocSimFrameToInputWires = false;
  allocSimFrameToOutputWires = false;

  simFrameAllocated = false;

  consumerPins: ConsumerPin[];
  producerPins: ProducerPin[];

  customCircuitProducerPins: ProducerPin[] | undefined;

  sceneObject: CircuitSceneObject | undefined;

  constructor() {
    this.sceneObject = undefined;
    const nConsumerPins = 1;
    const nProducerPins = 0;

    this.consumerPins = new Array(nConsumerPins);

    this.producerPins = Array(nProducerPins);

    for (let i = 0; i < this.consumerPins.length; i++) {
      this.consumerPins[i] = new ConsumerPin(this, i);
    }

    let consumerPin = this.consumerPins[0];
    consumerPin.onWireAttached = CustomCircuitOutputs.addPin;
  }

  clone(): Circuit {
    let cloned = circuitCloneHelper(this) as CustomCircuitOutputs;
    cloned.customCircuitProducerPins = undefined;
    return cloned;
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

  configSceneObject(pos: Vec2): void {
    if (sceneManager.currentScene.customCircuitOutputs != null) {
      throw Error();
    }

    this.sceneObject = new CircuitSceneObject(this, pos);
    sceneManager.currentScene.customCircuitOutputs = this.sceneObject.id;
  }

  static addPin(self: CustomCircuitOutputs) {
    const newPinIndex = self.consumerPins.length;
    let currentLastPin = self.consumerPins[newPinIndex - 1];
    currentLastPin.onWireAttached = () => {};

    let newPin = new ConsumerPin(self, newPinIndex);
    newPin.onWireAttached = CustomCircuitOutputs.addPin;
    self.consumerPins.push(newPin);
    if (self.sceneObject != null) {
      self.sceneObject.calcRects();
    }

    // console.log("Adding Pin");
    // console.log("New pin: ", newPin);
    // console.log("All pins: ", self.producerPins);
  }
}

export class CustomCircuit implements Circuit {
  allocSimFrameToSelf = false;
  allocSimFrameToInputWires = true;
  allocSimFrameToOutputWires = true;

  isSelected: boolean = false;
  simFrameAllocated = false;

  consumerPins: ConsumerPin[];
  producerPins: ProducerPin[];

  circuits: Circuit[];
  wires: Wire[];

  sceneObject: CircuitSceneObject | undefined;

  customInputs: CustomCircuitInputs;
  customOutputs: CustomCircuitOutputs;

  // scene: Scene;
  onClicked = () => {};

  constructor(
    customInputs: CustomCircuitInputs,
    customOutputs: CustomCircuitOutputs
  ) {
    this.circuits = [];
    this.wires = [];

    let circuitCloneMapping = new Map<Circuit, Circuit>();
    let wireCloneMapping = new Map<Wire, Wire>();

    cloneGraphAfterCircuit(
      customInputs,
      this.circuits,
      this.wires,
      circuitCloneMapping,
      wireCloneMapping
    );

    const newCustomInputs = circuitCloneMapping.get(customInputs);
    if (newCustomInputs == null) {
      throw Error();
    }
    this.customInputs = newCustomInputs as CustomCircuitInputs;

    const newCustomOutputs = circuitCloneMapping.get(customOutputs);
    if (newCustomOutputs == null) {
      throw Error();
    }
    this.customOutputs = newCustomOutputs as CustomCircuitOutputs;

    const nConsumerPins = this.customInputs.producerPins.length - 1;
    const nProducerPins = this.customOutputs.consumerPins.length - 1;

    this.sceneObject = undefined;

    this.producerPins = new Array(nProducerPins);
    for (let i = 0; i < nProducerPins; i++) {
      this.producerPins[i] = new ProducerPin(
        this,
        i,
        this.customOutputs.consumerPins[i].value
      );
    }

    this.consumerPins = new Array(nConsumerPins);
    for (let i = 0; i < nConsumerPins; i++) {
      this.consumerPins[i] = new ConsumerPin(this, i);
    }

    this.customOutputs.customCircuitProducerPins = this.producerPins;
    console.log("CustomCircuit.constructor: ", this);
  }

  configSceneObject(pos: Vec2): void {
    this.sceneObject = new CircuitSceneObject(this, pos);
  }

  clone(): Circuit {
    let cloned = circuitCloneHelper(this) as CustomCircuit;

    cloned.circuits = [];
    cloned.wires = [];

    let circuitCloneMapping = new Map<Circuit, Circuit>();
    let wireCloneMapping = new Map<Wire, Wire>();

    cloneGraphAfterCircuit(
      this.customInputs,
      cloned.circuits,
      cloned.wires,
      circuitCloneMapping,
      wireCloneMapping
    );

    const newCustomInputs = circuitCloneMapping.get(this.customInputs);
    if (newCustomInputs == null) {
      throw Error();
    }
    cloned.customInputs = newCustomInputs as CustomCircuitInputs;

    const newCustomOutputs = circuitCloneMapping.get(this.customOutputs);
    if (newCustomOutputs == null) {
      throw Error();
    }
    cloned.customOutputs = newCustomOutputs as CustomCircuitOutputs;

    cloned.customOutputs.customCircuitProducerPins = cloned.producerPins;

    return cloned;
  }

  updateHandeler(self: Circuit) {
    let circuit = self as CustomCircuit;
    console.log("CustomCircuit: ", circuit);
    console.log("CustomCircuit.this: ", this);

    circuit.customInputs.setValues(circuit.consumerPins);
  }
}
