import { Point, Rect } from "./math.js";
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
        ctx.lineWidth = 10;
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
        ctx.arc(pos.x, pos.y, ConsumerPin.radius, 0, 2 * Math.PI);
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
        ctx.arc(pos.x, pos.y, ConsumerPin.radius, 0, 2 * Math.PI);
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
        this.pos_x = pos_x;
        this.pos_y = pos_y;
        // pos_x: number;
        // pos_y: number;
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
        this.update = update;
        this.update(this);
        if (isInput) {
            scheduler.recurringEvents.push(this);
        }
    }
    Circuit.prototype.getProducerPinPos = function (pinIndex) {
        return new Point(this.pos_x + Circuit.width, this.pos_y + pinIndex * 70);
    };
    Circuit.prototype.getConsumerPinPos = function (pinIndex) {
        return new Point(this.pos_x, this.pos_y + pinIndex * 70);
    };
    Circuit.prototype.rect = function () {
        return new Rect(this.pos_x, this.pos_y, Circuit.width, this.consumerPins.length > this.producerPins.length
            ? this.consumerPins.length * 70
            : this.producerPins.length * 70);
    };
    Circuit.prototype.setPos = function (point) {
        this.pos_x = point.x;
        this.pos_y = point.y;
    };
    Circuit.prototype.draw = function (ctx) {
        for (var i = 0; i < this.consumerPins.length; i++) {
            this.consumerPins[i].draw(ctx);
        }
        for (var i = 0; i < this.producerPins.length; i++) {
            this.producerPins[i].draw(ctx);
        }
        ctx.fillStyle = "cyan";
        ctx.fillRect(this.pos_x, this.pos_y, Circuit.width, this.consumerPins.length > this.producerPins.length
            ? this.consumerPins.length * 70
            : this.producerPins.length * 70);
        if (this.isBeingHovered) {
            ctx.strokeStyle = "black";
            ctx.lineWidth = 1;
            ctx.strokeRect(this.pos_x, this.pos_y, Circuit.width, this.consumerPins.length > this.producerPins.length
                ? this.consumerPins.length * 70
                : this.producerPins.length * 70);
        }
    };
    Circuit.width = 100;
    return Circuit;
}());
export { Circuit };
