import { Vec2, Rect } from "@src/math.js";
import {
  ConcreteObjectKind,
  ColliderObject,
  Scene,
  UNDEFINED_OBJ_ID,
  SceneObject,
} from "../scene-manager.js";
import { domLog, sceneManager, simEngine, viewManager } from "@src/main.js";
import { SimEvent } from "@src/engine.js";
import { ConsumerPin } from "./consumer-pin.js";
import { ProducerPin } from "./producer-pin.js";
import { PIN_EXTRUSION_WRL, PIN_TO_PIN_DISTANCE_WRL } from "@src/config.js";
import { Queue } from "@src/queue.js";
import { Wire } from "./wire.js";

type CircuitUpdateHandeler = (self: Circuit) => void;

export interface Circuit extends SceneObject {
  id: number;

  tightRectWrl: Rect;
  looseRectWrl: Rect;

  consumerPins: ConsumerPin[];
  producerPins: ProducerPin[];
  updateHandeler: CircuitUpdateHandeler;

  allocSimFrameToSelf: boolean;
  allocSimFrameToInputWires: boolean;
  allocSimFrameToOutputWires: boolean;

  simFrameAllocated: boolean;

  isSelected: boolean;

  setPos(posWrl: Vec2): void;
  draw: (ctx: CanvasRenderingContext2D) => void;
  onClicked: () => void;
  clone(): Circuit;
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
  const tightRectScr = viewManager.worldToScreenRect(self.tightRectWrl);
  ctx.fillStyle = "cyan";
  ctx.fillRect(tightRectScr.x, tightRectScr.y, tightRectScr.w, tightRectScr.h);
  for (let i = 0; i < self.consumerPins.length; i++) {
    self.consumerPins[i].draw(ctx);
  }
  for (let i = 0; i < self.producerPins.length; i++) {
    self.producerPins[i].draw(ctx);
  }

  if (self.isSelected) {
    const looseRectScr = viewManager.worldToScreenRect(self.looseRectWrl);
    ctx.strokeStyle = "green";
    ctx.strokeRect(
      looseRectScr.x,
      looseRectScr.y,
      looseRectScr.w,
      looseRectScr.h
    );
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

function circuitCloneHelper(circuit: Circuit) {
  const cloned = Object.assign({}, circuit);
  cloned.producerPins = new Array(circuit.producerPins.length);
  cloned.consumerPins = new Array(circuit.consumerPins.length);

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
  cloned.looseRectWrl = cloned.looseRectWrl.clone();
  cloned.tightRectWrl = cloned.tightRectWrl.clone();
  Object.setPrototypeOf(cloned, Object.getPrototypeOf(circuit));
  console.log("[circuitCloneHelper] circuit: ", circuit);
  console.log("[circuitCloneHelper] cloned: ", cloned);
  return cloned;
}

export class InputCircuit implements Circuit {
  allocSimFrameToSelf = true;
  allocSimFrameToInputWires = true;
  allocSimFrameToOutputWires = true;

  isSelected: boolean = false;

  id: number;

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
    this.id = sceneManager.currentScene.registerCircuit(this);
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

  clone(): Circuit {
    return circuitCloneHelper(this);
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

  allocSimFrameToSelf = true;

  allocSimFrameToInputWires = true;
  allocSimFrameToOutputWires = true;

  id: number;

  updateHandeler: CircuitUpdateHandeler;

  tightRectWrl: Rect;
  looseRectWrl: Rect;

  isSelected: boolean = false;
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

    this.id = sceneManager.currentScene.registerCircuit(this);
  }

  setPos(posWrl: Vec2) {
    this.tightRectWrl.xy = posWrl;
    this.looseRectWrl = getCircuitLooseRectWrl(this.tightRectWrl);
  }

  clone(): Circuit {
    return circuitCloneHelper(this);
  }

  draw(ctx: CanvasRenderingContext2D) {
    drawCircuit(this, ctx);
  }
}

export class CustomCircuitInputs implements Circuit {
  simFrameAllocated = false;

  allocSimFrameToInputWires = false;
  allocSimFrameToOutputWires = false;
  allocSimFrameToSelf = false;

  isSelected: boolean = false;
  tightRectWrl: Rect;
  looseRectWrl: Rect;

  consumerPins: ConsumerPin[];
  producerPins: ProducerPin[];

  id: number;

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
    this.id = -1;

    if (sceneManager.currentScene.customCircuitInputs != null) {
      return;
    }

    this.id = sceneManager.currentScene.registerCircuit(this);
    sceneManager.currentScene.customCircuitInputs = this.id;
  }

  setPos(posWrl: Vec2) {
    this.tightRectWrl.xy = posWrl;
    this.looseRectWrl = getCircuitLooseRectWrl(this.tightRectWrl);
  }

  clone(): Circuit {
    return circuitCloneHelper(this);
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
  allocSimFrameToOutputWires = false;

  simFrameAllocated = false;

  isSelected: boolean = false;
  id: number;

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
    this.id = -1;

    if (sceneManager.currentScene.customCircuitOutputs != null) {
      return;
    }

    this.id = sceneManager.currentScene.registerCircuit(this);
    sceneManager.currentScene.customCircuitOutputs = this.id;
  }

  setPos(posWrl: Vec2) {
    this.tightRectWrl.xy = posWrl;
    this.looseRectWrl = getCircuitLooseRectWrl(this.tightRectWrl);
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
  allocSimFrameToOutputWires = true;

  isSelected: boolean = false;
  simFrameAllocated = false;

  id: number;

  // objects: Map<number, SceneObject>

  tightRectWrl: Rect;
  looseRectWrl: Rect;

  consumerPins: ConsumerPin[];
  producerPins: ProducerPin[];

  objects: Map<number, SceneObject>;
  customCircuitInputs: number;
  customCircuitOutputs: number;

  // scene: Scene;
  onClicked = () => {};

  constructor(
    sceneId: number,

    pos_x: number,
    pos_y: number
  ) {
    console.log("SceneId: ", sceneId);
    const scene = sceneManager.scenes.get(sceneId);
    if (scene == null) {
      domLog("[CustomCircuit] scene == null");
      throw Error();
    }
    if (scene.customCircuitInputs == null) {
      domLog("[CustomCircuit] scene.customCircuitIO.i == null");
      throw Error();
    }
    if (scene.customCircuitOutputs == null) {
      domLog("[CustomCircuit] scene.customCircuitIO.o == null");
      throw Error();
    }
    this.customCircuitInputs = scene.customCircuitInputs;
    this.customCircuitOutputs = scene.customCircuitOutputs;

    this.objects = new Map();
    CustomCircuit.cloneCircuitTree(
      scene.objects,
      scene.customCircuitInputs,
      ConcreteObjectKind.Circuit,
      this.objects
    );

    const customInputs = this.objects.get(
      this.customCircuitInputs
    ) as CustomCircuitInputs;

    const customOutputs = this.objects.get(
      this.customCircuitOutputs
    ) as CustomCircuitOutputs;

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
      this.producerPins[i] = new ProducerPin(
        this,
        i,
        customOutputs.consumerPins[i].value
      );
    }

    this.consumerPins = new Array(nConsumerPins);
    for (let i = 0; i < nConsumerPins; i++) {
      this.consumerPins[i] = new ConsumerPin(this, i);
    }

    customOutputs.customCircuitProducerPins = this.producerPins;

    // this.updateHandeler(this);

    this.id = sceneManager.currentScene.registerCircuit(this);
  }

  clone(): Circuit {
    let cloned = circuitCloneHelper(this) as CustomCircuit;
    cloned.objects = new Map();
    CustomCircuit.cloneCircuitTree(
      this.objects,
      this.customCircuitInputs,
      ConcreteObjectKind.Circuit,
      cloned.objects
    );
    const customOutputs_ = cloned.objects.get(cloned.customCircuitOutputs);
    if (customOutputs_ == null) {
      throw Error();
    }
    const customOutputs = customOutputs_ as CustomCircuitOutputs;
    customOutputs.customCircuitProducerPins = cloned.producerPins;

    return cloned;
  }

  // This function is only supposed to be called with startType === ConcreteObjectKind.Circuit
  static cloneCircuitTree(
    objects: Map<number, SceneObject>,
    startId: number,
    startType: ConcreteObjectKind,
    clonedObjects: Map<number, SceneObject>
  ) {
    let tmp = clonedObjects.get(startId);
    if (tmp != null) {
      if (startType === ConcreteObjectKind.Circuit) {
        return tmp as Circuit;
      } else {
        return tmp as Wire;
      }
    }

    let start = objects.get(startId);
    if (start == null) {
      console.log("[cloneCircuitTree] objects: ", objects);
      console.log("[cloneCircuitTree] startId: ", startId);
      console.log("[cloneCircuitTree] startType: ", startType);
      domLog("[cloneCircuitTree] start == null");
      throw Error();
    }
    if (startType === ConcreteObjectKind.Circuit) {
      let circuit = start as Circuit;
      let cloned = circuit.clone();
      clonedObjects.set(startId, cloned);
      for (let pPinIdx = 0; pPinIdx < circuit.producerPins.length; pPinIdx++) {
        for (
          let wireIdx = 0;
          wireIdx < circuit.producerPins[pPinIdx].wires.length;
          wireIdx++
        ) {
          console.log("[cloneCircuitTree] pPinIdx: ", pPinIdx);
          console.log("[cloneCircuitTree] circuit: ", circuit);
          console.log("[cloneCircuitTree] cloned: ", cloned);
          cloned.producerPins[pPinIdx].wires[wireIdx] = this.cloneCircuitTree(
            objects,
            circuit.producerPins[pPinIdx].wires[wireIdx].id,
            ConcreteObjectKind.Wire,
            clonedObjects
          ) as Wire;
        }
      }
      return cloned;
    } else if (startType === ConcreteObjectKind.Wire) {
      let wire = start as Wire;
      let cloned = wire.clone();
      clonedObjects.set(startId, cloned);
      if (wire.consumerPin != null) {
        const consumerCircuitId = wire.consumerPin.parentCircuit.id;
        let consumerCircuit = this.cloneCircuitTree(
          objects,
          consumerCircuitId,
          ConcreteObjectKind.Circuit,
          clonedObjects
        ) as Circuit;
        console.log("[cloneCircuitTree] [Wire] id: ", startId);
        console.log("[cloneCircuitTree] [Wire] wire: ", wire);
        console.log("[cloneCircuitTree] [Wire] cloned: ", cloned);
        cloned.setConsumerPinNoUpdate(
          consumerCircuit.consumerPins[wire.consumerPin.pinIndex]
        );
      }
      if (wire.producerPin != null) {
        const producerCircuitID = wire.producerPin.parentCircuit.id;
        let producerCircuit = this.cloneCircuitTree(
          objects,
          producerCircuitID,
          ConcreteObjectKind.Circuit,
          clonedObjects
        ) as Circuit;
        cloned.setProducerPinNoUpdate(
          producerCircuit.producerPins[wire.producerPin.pinIndex]
        );
      }
      return cloned;
    }
    throw Error();
  }

  updateHandeler(self: Circuit) {
    let circuit = self as CustomCircuit;
    let customInputs = circuit.objects.get(
      circuit.customCircuitInputs
    ) as CustomCircuitInputs;

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
