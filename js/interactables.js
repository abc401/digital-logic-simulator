import { Vec2, Rect, Circle } from "./math.js";
import { zoomLevel } from "./canvas.js";
import { ConcreteObjectKind, VirtualObject } from "./scene-manager.js";
import { sceneManager, simEngine, viewManager, wires } from "./main.js";
import { SimEvent } from "./engine.js";
var Wire = /** @class */ (function () {
    function Wire(producerPin, consumerPin) {
        this.producerPin = producerPin;
        this.consumerPin = consumerPin;
        wires.push(this);
        console.log("[Wire Constructor]");
        if (producerPin != null) {
            producerPin.wires.push(this);
        }
        if (consumerPin != null) {
            consumerPin.wire = this;
        }
        if (producerPin == null || consumerPin == null) {
            console.log("[Wire Constructor] producerPin == null || consumerPin == null");
            return;
        }
        this.propogateValue(producerPin.value);
    }
    Wire.prototype.update = function (self) {
        if (self.consumerPin == null) {
            console.log("Consumer == null");
        }
        if (self.producerPin == null) {
            console.log("Producer == null");
        }
        if (self.consumerPin == null || self.producerPin == null) {
            return;
        }
        self.consumerPin.value = self.producerPin.value;
        simEngine.nextFrameEvents.enqueue(new SimEvent(self.consumerPin.parentCircuit, self.consumerPin.parentCircuit.update));
    };
    Wire.prototype.detach = function () {
        var _this = this;
        if (this.consumerPin != null) {
            this.consumerPin.wire = undefined;
            this.consumerPin = undefined;
        }
        if (this.producerPin != null) {
            this.producerPin.wires = this.producerPin.wires.filter(function (wire) {
                return wire !== _this;
            });
            this.producerPin = undefined;
        }
    };
    Wire.prototype.isConsumerPinNull = function () {
        return this.consumerPin == null;
    };
    Wire.prototype.isProducerPinNull = function () {
        return this.producerPin == null;
    };
    Wire.prototype.getProducerPin = function () {
        return this.producerPin;
    };
    Wire.prototype.setProducerPin = function (pin) {
        this.producerPin = pin;
        pin.wires.push(this);
        console.log("Producer", pin.parentCircuit);
        if (this.consumerPin == null) {
            return;
        }
        console.log("propogated Value");
        this.propogateValue(this.producerPin.value);
    };
    Wire.prototype.getConsumerPin = function () {
        return this.consumerPin;
    };
    Wire.prototype.setConsumerPin = function (pin) {
        pin.wire = this;
        this.consumerPin = pin;
        console.log("Consumer: ", pin.parentCircuit);
        if (this.producerPin == null) {
            return;
        }
        console.log("Propogated Value");
        this.propogateValue(this.producerPin.value);
    };
    Wire.prototype.propogateValue = function (value) {
        if (this.consumerPin == null) {
            console.log("Consumer was null");
            return;
        }
        if (value === this.consumerPin.value) {
            console.log("produced === consumed");
            return;
        }
        this.consumerPin.value = value;
        console.log("Enqueued");
        simEngine.nextFrameEvents.enqueue(new SimEvent(this.consumerPin.parentCircuit, this.consumerPin.parentCircuit.update));
        // this.consumerPin.parentCircuit);
    };
    Wire.prototype.draw = function (ctx) {
        var from = this.producerPin == null ? this.fromScr : this.producerPin.getLocScr();
        var to = this.consumerPin == null ? this.toScr : this.consumerPin.getLocScr();
        if (from == null || to == null) {
            return;
        }
        if (this.consumerPin && this.consumerPin.value) {
            ctx.strokeStyle = "blue";
        }
        else {
            ctx.strokeStyle = "black";
        }
        ctx.lineWidth = 10 * viewManager.zoomLevel;
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.closePath();
        ctx.stroke();
    };
    return Wire;
}());
export { Wire };
var ConsumerPin = /** @class */ (function () {
    function ConsumerPin(parentCircuit, pinIndex) {
        this.parentCircuit = parentCircuit;
        this.pinIndex = pinIndex;
        this.value = false;
        sceneManager.track(this.getVirtualObject());
    }
    ConsumerPin.prototype.getVirtualObject = function () {
        var _this = this;
        return new VirtualObject(ConcreteObjectKind.ConsumerPin, this, new Circle(function () { return viewManager.screenToWorld(_this.getLocScr()); }, ConsumerPin.radiusWrl));
    };
    ConsumerPin.prototype.getLocScr = function () {
        return this.parentCircuit.conPinLocScr(this.pinIndex);
    };
    ConsumerPin.prototype.draw = function (ctx) {
        var pos = this.getLocScr();
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, ConsumerPin.radiusWrl * viewManager.zoomLevel, 0, 2 * Math.PI);
        if (this.value) {
            ctx.fillStyle = "red";
            ctx.fill();
        }
        else {
            ctx.lineWidth = 1;
            ctx.fillStyle = "white";
            ctx.fill();
            ctx.strokeStyle = "red";
            ctx.stroke();
        }
    };
    ConsumerPin.radiusWrl = 10;
    return ConsumerPin;
}());
export { ConsumerPin };
var ProducerPin = /** @class */ (function () {
    function ProducerPin(parentCircuit, pinIndex, value) {
        if (value === void 0) { value = false; }
        this.parentCircuit = parentCircuit;
        this.pinIndex = pinIndex;
        this.selected = false;
        this.wires = [];
        this.value = value;
        sceneManager.track(this.getVirtualObject());
    }
    ProducerPin.prototype.setValue = function (value) {
        if (this.value === value) {
            // console.log("[producer.setValue] producer.value === new value");
            return;
        }
        this.value = value;
        for (var i = 0; i < this.wires.length; i++) {
            simEngine.nextFrameEvents.enqueue(new SimEvent(this.wires[i], this.wires[i].update));
            // this.wires[i].propogateValue(value);
        }
    };
    ProducerPin.prototype.getLocScr = function () {
        return this.parentCircuit.prodPinLocScr(this.pinIndex);
    };
    ProducerPin.prototype.getVirtualObject = function () {
        var _this = this;
        return new VirtualObject(ConcreteObjectKind.ProducerPin, this, new Circle(function () { return viewManager.screenToWorld(_this.getLocScr()); }, ProducerPin.radiusWrl));
    };
    ProducerPin.prototype.draw = function (ctx) {
        var pos = this.getLocScr();
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, ProducerPin.radiusWrl * viewManager.zoomLevel, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.lineWidth = 1;
        if (this.value) {
            ctx.fillStyle = "red";
        }
        else {
            ctx.fillStyle = "white";
            ctx.strokeStyle = "red";
            ctx.stroke();
        }
        if (this.selected) {
            ctx.strokeStyle = "green";
            ctx.stroke();
        }
        ctx.fill();
    };
    ProducerPin.radiusWrl = 10;
    return ProducerPin;
}());
export { ProducerPin };
var Circuit = /** @class */ (function () {
    function Circuit(nConsumerPins, nProducerPins, pos_x, pos_y, update, isInput) {
        if (isInput === void 0) { isInput = false; }
        this.isBeingHovered = false;
        if (nConsumerPins % 1 !== 0) {
            throw Error("Expected nConsumerPins to be integer but got: ".concat(nConsumerPins));
        }
        if (nProducerPins % 1 !== 0) {
            throw Error("Expected nProducerPins to be integer but got: ".concat(nProducerPins));
        }
        this.rectWrl = new Rect(pos_x, pos_y, Circuit.width, nConsumerPins > nProducerPins ? nConsumerPins * 70 : nProducerPins * 70);
        this.consumerPins = Array(nConsumerPins);
        for (var i = 0; i < this.consumerPins.length; i++) {
            this.consumerPins[i] = new ConsumerPin(this, i);
        }
        this.producerPins = Array(nProducerPins);
        for (var i = 0; i < this.producerPins.length; i++) {
            this.producerPins[i] = new ProducerPin(this, i);
        }
        this.update = update;
        this.update(this);
        if (isInput) {
            simEngine.recurringEvents.push(new SimEvent(this, this.update));
        }
        sceneManager.track(this.getVirtualObject());
    }
    Circuit.prototype.prodPinLocWrl = function (pinIndex) {
        return new Vec2(this.rectWrl.x + this.rectWrl.w, this.rectWrl.y + pinIndex * Circuit.pinToPinDist);
    };
    Circuit.prototype.prodPinLocScr = function (pinIndex) {
        var rect = this.screenRect();
        return new Vec2(rect.x + rect.w, rect.y + pinIndex * Circuit.pinToPinDist * zoomLevel);
    };
    Circuit.prototype.conPinLocScr = function (pinIndex) {
        return viewManager.worldToScreen(new Vec2(this.rectWrl.x, this.rectWrl.y + pinIndex * 70));
        // pos.x * zoomScale + panOffset.x,
        // pos.y * zoomScale + panOffset.y,
        // ConsumerPin.radius * zoomScale,
        // 0,
        // 2 * Math.PI
    };
    Circuit.prototype.getVirtualObject = function () {
        return new VirtualObject(ConcreteObjectKind.Circuit, this, this.rectWrl);
    };
    Circuit.prototype.screenRect = function () {
        return new Rect(this.rectWrl.x * viewManager.zoomLevel + viewManager.panOffset.x, this.rectWrl.y * viewManager.zoomLevel + viewManager.panOffset.y, Circuit.width * viewManager.zoomLevel, (this.consumerPins.length > this.producerPins.length
            ? this.consumerPins.length * 70
            : this.producerPins.length * 70) * viewManager.zoomLevel);
    };
    Circuit.prototype.draw = function (ctx) {
        for (var i = 0; i < this.consumerPins.length; i++) {
            this.consumerPins[i].draw(ctx);
        }
        for (var i = 0; i < this.producerPins.length; i++) {
            this.producerPins[i].draw(ctx);
        }
        var boundingRect = this.screenRect();
        ctx.fillStyle = "cyan";
        ctx.fillRect(boundingRect.x, boundingRect.y, boundingRect.w, boundingRect.h);
        if (this.isBeingHovered) {
            ctx.strokeStyle = "black";
            ctx.lineWidth = 1;
            ctx.strokeRect(boundingRect.x, boundingRect.y, boundingRect.w, boundingRect.h);
        }
    };
    Circuit.width = 100;
    Circuit.pinToPinDist = 70;
    return Circuit;
}());
export { Circuit };
