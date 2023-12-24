import { Vec2, Rect } from "./math.js";
import { zoomScale, panOffset, worldToScreen } from "./canvas.js";
var Wire = /** @class */ (function () {
    function Wire(producerCircuit, producerPinIndex, consumerCircuit, consumerPinIndex, scheduler) {
        this.producerCircuit = producerCircuit;
        this.producerPinIndex = producerPinIndex;
        this.consumerCircuit = consumerCircuit;
        this.consumerPinIndex = consumerPinIndex;
        this.scheduler = scheduler;
        producerCircuit.producerPins[producerPinIndex].wires.push(this);
        var producedValue = producerCircuit.producerPins[producerPinIndex].value;
        var consumedValue = consumerCircuit.consumerPins[consumerPinIndex].value;
        if (producedValue !== consumedValue) {
            this.propogateValue(producedValue);
        }
    }
    Wire.prototype.propogateValue = function (value) {
        var consumerPin = this.consumerCircuit.consumerPins[this.consumerPinIndex];
        if (value === consumerPin.value) {
            return;
        }
        consumerPin.value = value;
        this.scheduler.nextFrameEvents.enqueue(this.consumerCircuit);
    };
    Wire.prototype.draw = function (ctx) {
        var from = this.producerCircuit.getProducerPinPos(this.producerPinIndex);
        var to = this.consumerCircuit.getConsumerPinPos(this.consumerPinIndex);
        if (this.producerCircuit.producerPins[this.producerPinIndex].value) {
            ctx.strokeStyle = "blue";
        }
        else {
            ctx.strokeStyle = "black";
        }
        ctx.lineWidth = 10 * zoomScale;
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
    }
    ConsumerPin.prototype.draw = function (ctx) {
        var pos = this.parentCircuit.getConsumerPinPos(this.pinIndex);
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, ConsumerPin.radius * zoomScale, 0, 2 * Math.PI);
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
    ConsumerPin.radius = 10;
    return ConsumerPin;
}());
var ProducerPin = /** @class */ (function () {
    function ProducerPin(parentCircuit, pinIndex, value) {
        if (value === void 0) { value = false; }
        this.parentCircuit = parentCircuit;
        this.pinIndex = pinIndex;
        this.wires = [];
        this.value = value;
    }
    ProducerPin.prototype.setValue = function (value) {
        if (this.value === value) {
            return;
        }
        this.value = value;
        for (var i = 0; i < this.wires.length; i++) {
            this.wires[i].propogateValue(value);
        }
    };
    ProducerPin.prototype.draw = function (ctx) {
        var pos = this.parentCircuit.getProducerPinPos(this.pinIndex);
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, ConsumerPin.radius * zoomScale, 0, 2 * Math.PI);
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
    ProducerPin.radius = 10;
    return ProducerPin;
}());
var Circuit = /** @class */ (function () {
    // scheduler: Scheduler;
    function Circuit(nConsumerPins, nProducerPins, scheduler, pos_x, pos_y, update, isInput) {
        if (isInput === void 0) { isInput = false; }
        this.scheduler = scheduler;
        this.isBeingHovered = false;
        if (nConsumerPins % 1 !== 0) {
            throw Error("Expected nConsumerPins to be integer but got: ".concat(nConsumerPins));
        }
        if (nProducerPins % 1 !== 0) {
            throw Error("Expected nProducerPins to be integer but got: ".concat(nProducerPins));
        }
        this.consumerPins = Array(nConsumerPins);
        for (var i = 0; i < this.consumerPins.length; i++) {
            this.consumerPins[i] = new ConsumerPin(this, i);
        }
        this.producerPins = Array(nProducerPins);
        for (var i = 0; i < this.producerPins.length; i++) {
            this.producerPins[i] = new ProducerPin(this, i);
        }
        this.pos = new Vec2(pos_x, pos_y);
        this.update = update;
        this.update(this);
        if (isInput) {
            scheduler.recurringEvents.push(this);
        }
    }
    Circuit.prototype.getProducerPinPos = function (pinIndex) {
        var rect = this.screenRect();
        return new Vec2(rect.x + rect.width, rect.y + pinIndex * Circuit.pinToPinDist * zoomScale);
    };
    Circuit.prototype.getConsumerPinPos = function (pinIndex) {
        return worldToScreen(new Vec2(this.pos.x, this.pos.y + pinIndex * 70));
        // pos.x * zoomScale + panOffset.x,
        // pos.y * zoomScale + panOffset.y,
        // ConsumerPin.radius * zoomScale,
        // 0,
        // 2 * Math.PI
    };
    Circuit.prototype.screenRect = function () {
        return new Rect(this.pos.x * zoomScale + panOffset.x, this.pos.y * zoomScale + panOffset.y, Circuit.width * zoomScale, (this.consumerPins.length > this.producerPins.length
            ? this.consumerPins.length * 70
            : this.producerPins.length * 70) * zoomScale);
    };
    Circuit.prototype.worldRect = function () {
        return new Rect(this.pos.x, this.pos.y, Circuit.width, this.consumerPins.length > this.producerPins.length
            ? this.consumerPins.length * 70
            : this.producerPins.length * 70);
    };
    Circuit.prototype.setPos = function (point) {
        this.pos = point;
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
        ctx.fillRect(boundingRect.x, boundingRect.y, boundingRect.width, boundingRect.height);
        if (this.isBeingHovered) {
            ctx.strokeStyle = "black";
            ctx.lineWidth = 1;
            ctx.strokeRect(boundingRect.x, boundingRect.y, boundingRect.width, boundingRect.height);
        }
    };
    Circuit.width = 100;
    Circuit.pinToPinDist = 70;
    return Circuit;
}());
export { Circuit };
