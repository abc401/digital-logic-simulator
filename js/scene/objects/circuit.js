import { Vec2, Rect } from "../../math.js";
import { ConcreteObjectKind, } from "../scene-manager.js";
import { domLog, sceneManager, simEngine, viewManager } from "../../main.js";
import { SimEvent } from "../../engine.js";
import { ConsumerPin } from "./consumer-pin.js";
import { ProducerPin } from "./producer-pin.js";
import { PIN_EXTRUSION_WRL, PIN_TO_PIN_DISTANCE_WRL } from "../../config.js";
function getCircuitLooseRectWrl(tightRectWrl) {
    return new Rect(tightRectWrl.x - PIN_EXTRUSION_WRL, tightRectWrl.y - 3, tightRectWrl.w + 2 * PIN_EXTRUSION_WRL, tightRectWrl.h + 6);
}
function calculateCircuitRects(pos, nConsumerPins, nProducerPins) {
    const higherPinNumber = nConsumerPins > nProducerPins ? nConsumerPins : nProducerPins;
    const tightRectWrl = new Rect(pos.x, pos.y, 100, (ConsumerPin.radiusWrl * 2 + PIN_TO_PIN_DISTANCE_WRL) *
        (higherPinNumber - 1) +
        ConsumerPin.radiusWrl * 2);
    const looseRectWrl = new Rect(tightRectWrl.x - PIN_EXTRUSION_WRL, tightRectWrl.y - 3, tightRectWrl.w + 2 * PIN_EXTRUSION_WRL, tightRectWrl.h + 6);
    return [tightRectWrl, looseRectWrl];
}
function drawCircuit(self, ctx) {
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
export class CircuitColliderObject {
    constructor(circuit) {
        this.circuit = circuit;
    }
    looseCollisionCheck(pointWrl) {
        const res = this.circuit.looseRectWrl.pointIntersection(pointWrl);
        if (res) {
            console.log("Loose Collision Passed");
        }
        return res;
    }
    tightCollisionCheck(pointWrl) {
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
function circuitCloneHelper(circuit) {
    const cloned = Object.assign({}, circuit);
    cloned.producerPins = new Array(circuit.producerPins.length);
    cloned.consumerPins = new Array(circuit.consumerPins.length);
    for (let i = 0; i < circuit.producerPins.length; i++) {
        cloned.producerPins[i] = new ProducerPin(cloned, i, circuit.producerPins[i].value);
    }
    for (let i = 0; i < circuit.consumerPins.length; i++) {
        cloned.consumerPins[i] = new ConsumerPin(cloned, i, circuit.consumerPins[i].value);
    }
    cloned.looseRectWrl = cloned.looseRectWrl.clone();
    cloned.tightRectWrl = cloned.tightRectWrl.clone();
    Object.setPrototypeOf(cloned, Object.getPrototypeOf(circuit));
    console.log("[circuitCloneHelper] circuit: ", circuit);
    console.log("[circuitCloneHelper] cloned: ", cloned);
    return cloned;
}
export class InputCircuit {
    constructor(value, pos_x, pos_y) {
        this.value = value;
        this.allocSimFrameToSelf = true;
        this.allocSimFrameToInputWires = true;
        this.allocSimFrameToOutputWires = true;
        this.simFrameAllocated = false;
        [this.tightRectWrl, this.looseRectWrl] = calculateCircuitRects(new Vec2(pos_x, pos_y), 0, 1);
        this.consumerPins = new Array();
        this.producerPins = Array(1);
        for (let i = 0; i < this.producerPins.length; i++) {
            this.producerPins[i] = new ProducerPin(this, i);
        }
        this.updateHandeler(this);
        simEngine.recurringEvents.push(new SimEvent(this, this.updateHandeler));
        this.id = sceneManager.currentScene.registerCircuit(this);
    }
    setPos(posWrl) {
        this.tightRectWrl.xy = posWrl;
        this.looseRectWrl = getCircuitLooseRectWrl(this.tightRectWrl);
    }
    updateHandeler(self_) {
        let self = self_;
        self.producerPins[0].setValue(self.value);
        self.simFrameAllocated = false;
    }
    clone() {
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
    draw(ctx) {
        drawCircuit(this, ctx);
    }
}
export class ProcessingCircuit {
    constructor(nConsumerPins, nProducerPins, updateHandeler, pos_x, pos_y) {
        this.simFrameAllocated = false;
        this.allocSimFrameToSelf = true;
        this.allocSimFrameToInputWires = true;
        this.allocSimFrameToOutputWires = true;
        this.onClicked = () => { };
        [this.tightRectWrl, this.looseRectWrl] = calculateCircuitRects(new Vec2(pos_x, pos_y), nConsumerPins, nProducerPins);
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
    setPos(posWrl) {
        this.tightRectWrl.xy = posWrl;
        this.looseRectWrl = getCircuitLooseRectWrl(this.tightRectWrl);
    }
    clone() {
        return circuitCloneHelper(this);
    }
    draw(ctx) {
        drawCircuit(this, ctx);
    }
}
export class CustomCircuitInputs {
    constructor(pos_x, pos_y) {
        this.simFrameAllocated = false;
        this.allocSimFrameToInputWires = false;
        this.allocSimFrameToOutputWires = false;
        this.allocSimFrameToSelf = false;
        this.updateHandeler = () => { };
        [this.tightRectWrl, this.looseRectWrl] = calculateCircuitRects(new Vec2(pos_x, pos_y), 0, 1);
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
    setPos(posWrl) {
        this.tightRectWrl.xy = posWrl;
        this.looseRectWrl = getCircuitLooseRectWrl(this.tightRectWrl);
    }
    clone() {
        return circuitCloneHelper(this);
    }
    setValues(pins) {
        for (let i = 0; i < this.producerPins.length - 1; i++) {
            // this.producerPins[i].setValue(pins[i].value);
            this.producerPins[i].value = pins[i].value;
            for (let wire of this.producerPins[i].wires) {
                wire.update(wire);
            }
        }
    }
    static addPin(self) {
        const newPinIndex = self.producerPins.length;
        let currentLastPin = self.producerPins[newPinIndex - 1];
        currentLastPin.onWireAttached = () => { };
        let newPin = new ProducerPin(self, newPinIndex);
        newPin.onWireAttached = CustomCircuitInputs.addPin;
        self.producerPins.push(newPin);
        [self.tightRectWrl, self.looseRectWrl] = calculateCircuitRects(self.tightRectWrl.xy, 0, self.producerPins.length);
        // console.log("Adding Pin");
        // console.log("New pin: ", newPin);
        // console.log("All pins: ", self.producerPins);
    }
    onClicked() { }
    draw(ctx) {
        drawCircuit(this, ctx);
    }
}
export class CustomCircuitOutputs {
    constructor(pos_x, pos_y) {
        this.allocSimFrameToSelf = false;
        this.allocSimFrameToInputWires = false;
        this.allocSimFrameToOutputWires = false;
        this.simFrameAllocated = false;
        const nConsumerPins = 1;
        const nProducerPins = 0;
        [this.tightRectWrl, this.looseRectWrl] = calculateCircuitRects(new Vec2(pos_x, pos_y), nConsumerPins, nProducerPins);
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
    setPos(posWrl) {
        this.tightRectWrl.xy = posWrl;
        this.looseRectWrl = getCircuitLooseRectWrl(this.tightRectWrl);
    }
    clone() {
        let cloned = circuitCloneHelper(this);
        cloned.customCircuitProducerPins = undefined;
        return cloned;
    }
    updateHandeler(self) {
        let circuit = self;
        if (circuit.customCircuitProducerPins == null) {
            console.log("circuit.customCircuitProducerPins == null");
            return;
        }
        for (let i = 0; i < circuit.consumerPins.length - 1; i++) {
            circuit.customCircuitProducerPins[i].setValue(circuit.consumerPins[i].value);
        }
    }
    static addPin(self) {
        const newPinIndex = self.consumerPins.length;
        let currentLastPin = self.consumerPins[newPinIndex - 1];
        currentLastPin.onWireAttached = () => { };
        let newPin = new ConsumerPin(self, newPinIndex);
        newPin.onWireAttached = CustomCircuitOutputs.addPin;
        self.consumerPins.push(newPin);
        [self.tightRectWrl, self.looseRectWrl] = calculateCircuitRects(self.tightRectWrl.xy, self.consumerPins.length, 0);
        // console.log("Adding Pin");
        // console.log("New pin: ", newPin);
        // console.log("All pins: ", self.producerPins);
    }
    onClicked() { }
    draw(ctx) {
        drawCircuit(this, ctx);
    }
}
export class CustomCircuit {
    constructor(sceneId, pos_x, pos_y) {
        this.allocSimFrameToSelf = false;
        this.allocSimFrameToInputWires = true;
        this.allocSimFrameToOutputWires = true;
        this.simFrameAllocated = false;
        // scene: Scene;
        this.onClicked = () => { };
        console.log("SceneId: ", sceneId);
        const scene = sceneManager.scenes.get(sceneId);
        if (scene == null ||
            scene.customCircuitInputs == null ||
            scene.customCircuitOutputs == null) {
            domLog("[CustomCircuit] scene == null || scene.customCircuitIO == null || scene.customCircuitIO.i == null  || scene.customCircuitIO.o == null");
            throw Error();
        }
        this.customCircuitInputs = scene.customCircuitInputs;
        this.customCircuitOutputs = scene.customCircuitOutputs;
        this.objects = new Map();
        CustomCircuit.cloneCircuitTree(scene, scene.customCircuitInputs, ConcreteObjectKind.Circuit, this.objects);
        const customInputs = this.objects.get(this.customCircuitInputs);
        const customOutputs = this.objects.get(this.customCircuitOutputs);
        const nConsumerPins = customInputs.producerPins.length - 1;
        const nProducerPins = customOutputs.consumerPins.length - 1;
        {
            [this.tightRectWrl, this.looseRectWrl] = calculateCircuitRects(new Vec2(pos_x, pos_y), nConsumerPins, nProducerPins);
        }
        this.producerPins = new Array(nProducerPins);
        for (let i = 0; i < nProducerPins; i++) {
            this.producerPins[i] = new ProducerPin(this, i, customOutputs.consumerPins[i].value);
        }
        this.consumerPins = new Array(nConsumerPins);
        for (let i = 0; i < nConsumerPins; i++) {
            this.consumerPins[i] = new ConsumerPin(this, i);
        }
        customOutputs.customCircuitProducerPins = this.producerPins;
        // this.updateHandeler(this);
        this.id = sceneManager.currentScene.registerCircuit(this);
    }
    clone() {
        return circuitCloneHelper(this);
    }
    // This function is only supposed to be called with startType === ConcreteObjectKind.Circuit
    static cloneCircuitTree(scene, startId, startType, clonedObjects) {
        let tmp = clonedObjects.get(startId);
        if (tmp != null) {
            if (startType === ConcreteObjectKind.Circuit) {
                return tmp;
            }
            else {
                return tmp;
            }
        }
        let start = scene.objects.get(startId);
        if (start == null) {
            throw Error();
        }
        if (startType === ConcreteObjectKind.Circuit) {
            let circuit = start;
            let cloned = circuit.clone();
            clonedObjects.set(startId, cloned);
            for (let pPinIdx = 0; pPinIdx < circuit.producerPins.length; pPinIdx++) {
                for (let wireIdx = 0; wireIdx < circuit.producerPins[pPinIdx].wires.length; wireIdx++) {
                    console.log("[cloneCircuitTree] pPinIdx: ", pPinIdx);
                    console.log("[cloneCircuitTree] circuit: ", circuit);
                    console.log("[cloneCircuitTree] cloned: ", cloned);
                    cloned.producerPins[pPinIdx].wires[wireIdx] = this.cloneCircuitTree(scene, circuit.producerPins[pPinIdx].wires[wireIdx].id, ConcreteObjectKind.Wire, clonedObjects);
                }
            }
            return cloned;
        }
        else if (startType === ConcreteObjectKind.Wire) {
            let wire = start;
            let cloned = wire.clone();
            if (wire.consumerPin != null) {
                const consumerCircuitId = wire.consumerPin.parentCircuit.id;
                let consumerCircuit = this.cloneCircuitTree(scene, consumerCircuitId, ConcreteObjectKind.Circuit, clonedObjects);
                console.log("[cloneCircuitTree] [Wire] id: ", startId);
                console.log("[cloneCircuitTree] [Wire] wire: ", wire);
                console.log("[cloneCircuitTree] [Wire] cloned: ", cloned);
                cloned.setConsumerPinNoUpdate(consumerCircuit.consumerPins[wire.consumerPin.pinIndex]);
            }
            if (wire.producerPin != null) {
                const producerCircuitID = wire.producerPin.parentCircuit.id;
                let producerCircuit = this.cloneCircuitTree(scene, producerCircuitID, ConcreteObjectKind.Circuit, clonedObjects);
                cloned.setProducerPinNoUpdate(producerCircuit.producerPins[wire.producerPin.pinIndex]);
            }
            return cloned;
        }
        throw Error();
    }
    updateHandeler(self) {
        let circuit = self;
        let customInputs = circuit.objects.get(circuit.customCircuitInputs);
        customInputs.setValues(circuit.consumerPins);
    }
    setPos(posWrl) {
        this.tightRectWrl.xy = posWrl;
        this.looseRectWrl = getCircuitLooseRectWrl(this.tightRectWrl);
    }
    draw(ctx) {
        drawCircuit(this, ctx);
    }
}
