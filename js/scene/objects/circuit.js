import { Rect } from "../../math.js";
import { ConcreteObjectKind, } from "../scene-manager.js";
import { sceneManager, simEngine, viewManager } from "../../main.js";
import { SimEvent } from "../../engine.js";
import { ConsumerPin } from "./consumer-pin.js";
import { ProducerPin } from "./producer-pin.js";
import { PIN_EXTRUSION_WRL, PIN_TO_PIN_DISTANCE_WRL } from "../../config.js";
import { cloneGraphAfterCircuit } from "../../interactivity/common.js";
export class CircuitSceneObject {
    constructor(parentCircuit, pos) {
        this.parentCircuit = parentCircuit;
        this.isSelected = false;
        this.onClicked = undefined;
        this.tightRectWrl = this.calcTightRect(pos);
        this.looseRectWrl = this.calcLooseRect(this.tightRectWrl);
        this.parentScene = sceneManager.currentSceneId;
        this.id = sceneManager.currentScene.registerCircuit(this);
    }
    calcTightRect(pos) {
        const nConsumerPins = this.parentCircuit.consumerPins.length;
        const nProducerPins = this.parentCircuit.producerPins.length;
        const higherPinNumber = nConsumerPins > nProducerPins ? nConsumerPins : nProducerPins;
        return new Rect(pos.x, pos.y, 100, (ConsumerPin.radiusWrl * 2 + PIN_TO_PIN_DISTANCE_WRL) *
            (higherPinNumber - 1) +
            ConsumerPin.radiusWrl * 2);
    }
    calcLooseRect(tightRect) {
        return new Rect(tightRect.x - PIN_EXTRUSION_WRL, tightRect.y - 3, tightRect.w + 2 * PIN_EXTRUSION_WRL, tightRect.h + 6);
    }
    calcRects() {
        const pos = this.tightRectWrl.xy;
        this.tightRectWrl = this.calcTightRect(pos);
        this.looseRectWrl = this.calcLooseRect(this.tightRectWrl);
    }
    setPos(posWrl) {
        this.tightRectWrl.xy = posWrl;
        this.looseRectWrl = this.calcLooseRect(this.tightRectWrl);
    }
    draw(ctx) {
        const tightRectScr = viewManager.worldToScreenRect(this.tightRectWrl);
        ctx.fillStyle = "cyan";
        ctx.fillRect(tightRectScr.x, tightRectScr.y, tightRectScr.w, tightRectScr.h);
        for (let i = 0; i < this.parentCircuit.consumerPins.length; i++) {
            this.parentCircuit.consumerPins[i].draw(ctx);
        }
        for (let i = 0; i < this.parentCircuit.producerPins.length; i++) {
            this.parentCircuit.producerPins[i].draw(ctx);
        }
        if (this.isSelected) {
            const looseRectScr = viewManager.worldToScreenRect(this.looseRectWrl);
            ctx.strokeStyle = "green";
            ctx.strokeRect(looseRectScr.x, looseRectScr.y, looseRectScr.w, looseRectScr.h);
        }
    }
}
export class CircuitColliderObject {
    constructor(circuit) {
        this.circuit = circuit;
    }
    looseCollisionCheck(pointWrl) {
        if (this.circuit.sceneObject == null) {
            throw Error();
        }
        const res = this.circuit.sceneObject.looseRectWrl.pointIntersection(pointWrl);
        if (res) {
            console.log("Loose Collision Passed");
        }
        return res;
    }
    tightCollisionCheck(pointWrl) {
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
function circuitCloneHelper(circuit) {
    const cloned = Object.assign({}, circuit);
    Object.setPrototypeOf(cloned, Object.getPrototypeOf(circuit));
    cloned.producerPins = new Array(circuit.producerPins.length);
    cloned.consumerPins = new Array(circuit.consumerPins.length);
    // cloned.sceneObject = undefined;
    for (let i = 0; i < circuit.producerPins.length; i++) {
        cloned.producerPins[i] = new ProducerPin(cloned, i, circuit.producerPins[i].value);
    }
    for (let i = 0; i < circuit.consumerPins.length; i++) {
        cloned.consumerPins[i] = new ConsumerPin(cloned, i, circuit.consumerPins[i].value);
    }
    console.log("[circuitCloneHelper] circuit: ", circuit);
    console.log("[circuitCloneHelper] cloned: ", cloned);
    return cloned;
}
export class InputCircuit {
    constructor(value) {
        this.value = value;
        this.allocSimFrameToSelf = true;
        this.allocSimFrameToInputWires = true;
        this.allocSimFrameToOutputWires = true;
        this.simFrameAllocated = false;
        this.sceneObject = undefined;
        this.consumerPins = new Array();
        this.producerPins = Array(1);
        for (let i = 0; i < this.producerPins.length; i++) {
            this.producerPins[i] = new ProducerPin(this, i);
        }
        this.updateHandeler(this);
        simEngine.recurringEvents.push(new SimEvent(this, this.updateHandeler));
    }
    updateHandeler(self_) {
        let self = self_;
        self.producerPins[0].setValue(self.value);
        self.simFrameAllocated = false;
    }
    clone() {
        return circuitCloneHelper(this);
    }
    configSceneObject(pos) {
        this.sceneObject = new CircuitSceneObject(this, pos);
    }
    static onClicked(self_) {
        let self = self_;
        self.value = !self.value;
        self.producerPins[0].setValue(self.value);
    }
}
export class ProcessingCircuit {
    constructor(nConsumerPins, nProducerPins, updateHandeler) {
        this.simFrameAllocated = false;
        this.allocSimFrameToSelf = true;
        this.allocSimFrameToInputWires = true;
        this.allocSimFrameToOutputWires = true;
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
    configSceneObject(pos) {
        this.sceneObject = new CircuitSceneObject(this, pos);
    }
    clone() {
        return circuitCloneHelper(this);
    }
}
export class CustomCircuitInputs {
    constructor() {
        this.simFrameAllocated = false;
        this.allocSimFrameToInputWires = false;
        this.allocSimFrameToOutputWires = false;
        this.allocSimFrameToSelf = false;
        this.updateHandeler = () => { };
        this.sceneObject = undefined;
        this.consumerPins = new Array();
        this.producerPins = Array(1);
        for (let i = 0; i < this.producerPins.length; i++) {
            this.producerPins[i] = new ProducerPin(this, i);
        }
        let producerPin = this.producerPins[0];
        producerPin.onWireAttached = CustomCircuitInputs.addPin;
    }
    clone() {
        return circuitCloneHelper(this);
    }
    configSceneObject(pos) {
        if (sceneManager.currentScene.customCircuitInputs != null) {
            throw Error();
        }
        this.sceneObject = new CircuitSceneObject(this, pos);
        sceneManager.currentScene.customCircuitInputs = this.sceneObject.id;
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
        if (self.sceneObject != null) {
            self.sceneObject.calcRects();
        }
        // console.log("Adding Pin");
        // console.log("New pin: ", newPin);
        // console.log("All pins: ", self.producerPins);
    }
}
export class CustomCircuitOutputs {
    constructor() {
        this.allocSimFrameToSelf = false;
        this.allocSimFrameToInputWires = false;
        this.allocSimFrameToOutputWires = false;
        this.simFrameAllocated = false;
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
    configSceneObject(pos) {
        if (sceneManager.currentScene.customCircuitOutputs != null) {
            throw Error();
        }
        this.sceneObject = new CircuitSceneObject(this, pos);
        sceneManager.currentScene.customCircuitOutputs = this.sceneObject.id;
    }
    static addPin(self) {
        const newPinIndex = self.consumerPins.length;
        let currentLastPin = self.consumerPins[newPinIndex - 1];
        currentLastPin.onWireAttached = () => { };
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
export class CustomCircuit {
    constructor(customInputs, customOutputs) {
        this.allocSimFrameToSelf = false;
        this.allocSimFrameToInputWires = true;
        this.allocSimFrameToOutputWires = true;
        this.isSelected = false;
        this.simFrameAllocated = false;
        // scene: Scene;
        this.onClicked = () => { };
        this.circuits = [];
        this.wires = [];
        let circuitCloneMapping = new Map();
        let wireCloneMapping = new Map();
        cloneGraphAfterCircuit(customInputs, this.circuits, this.wires, circuitCloneMapping, wireCloneMapping);
        const newCustomInputs = circuitCloneMapping.get(customInputs);
        if (newCustomInputs == null) {
            throw Error();
        }
        this.customInputs = newCustomInputs;
        const newCustomOutputs = circuitCloneMapping.get(customOutputs);
        if (newCustomOutputs == null) {
            throw Error();
        }
        this.customOutputs = newCustomOutputs;
        const nConsumerPins = this.customInputs.producerPins.length - 1;
        const nProducerPins = this.customOutputs.consumerPins.length - 1;
        this.sceneObject = undefined;
        this.producerPins = new Array(nProducerPins);
        for (let i = 0; i < nProducerPins; i++) {
            this.producerPins[i] = new ProducerPin(this, i, this.customOutputs.consumerPins[i].value);
        }
        this.consumerPins = new Array(nConsumerPins);
        for (let i = 0; i < nConsumerPins; i++) {
            this.consumerPins[i] = new ConsumerPin(this, i);
        }
        this.customOutputs.customCircuitProducerPins = this.producerPins;
        console.log("CustomCircuit.constructor: ", this);
    }
    configSceneObject(pos) {
        this.sceneObject = new CircuitSceneObject(this, pos);
    }
    clone() {
        let cloned = circuitCloneHelper(this);
        cloned.circuits = [];
        cloned.wires = [];
        let circuitCloneMapping = new Map();
        let wireCloneMapping = new Map();
        cloneGraphAfterCircuit(this.customInputs, cloned.circuits, cloned.wires, circuitCloneMapping, wireCloneMapping);
        const newCustomInputs = circuitCloneMapping.get(this.customInputs);
        if (newCustomInputs == null) {
            throw Error();
        }
        cloned.customInputs = newCustomInputs;
        const newCustomOutputs = circuitCloneMapping.get(this.customOutputs);
        if (newCustomOutputs == null) {
            throw Error();
        }
        cloned.customOutputs = newCustomOutputs;
        cloned.customOutputs.customCircuitProducerPins = cloned.producerPins;
        return cloned;
    }
    updateHandeler(self) {
        let circuit = self;
        console.log("CustomCircuit: ", circuit);
        console.log("CustomCircuit.this: ", this);
        circuit.customInputs.setValues(circuit.consumerPins);
    }
}
