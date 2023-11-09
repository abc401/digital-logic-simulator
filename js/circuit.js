var Wire = /** @class */ (function () {
    function Wire(from, fromPinNumber, to, toPinNumber, scheduler) {
        this.scheduler = scheduler;
        this.producerCircuit = from;
        this.producerPinNumber = fromPinNumber;
        from.producerPins[fromPinNumber].wires.push(this);
        this.consumerCircuit = to;
        this.consumerPinNumber = toPinNumber;
    }
    Wire.prototype.propogateValue = function (value) {
        var consumerPin = this.consumerCircuit.consumerPins[this.consumerPinNumber];
        if (value === consumerPin.value) {
            return;
        }
        consumerPin.value = value;
        this.scheduler.backEventBuffer.enqueue(this.consumerCircuit);
    };
    Wire.prototype.draw = function (ctx) {
        var fromX = this.producerCircuit.producerPins[this.producerPinNumber].pos_x;
        var fromY = this.producerCircuit.producerPins[this.producerPinNumber].pos_y;
        var toX = this.consumerCircuit.consumerPins[this.consumerPinNumber].pos_x;
        var toY = this.consumerCircuit.consumerPins[this.consumerPinNumber].pos_y;
        if (this.producerCircuit.producerPins[this.producerPinNumber].value) {
            ctx.strokeStyle = "blue";
        }
        else {
            ctx.strokeStyle = "black";
        }
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.closePath();
        ctx.stroke();
    };
    return Wire;
}());
export { Wire };
var ConsumerPin = /** @class */ (function () {
    function ConsumerPin(circuit, pos_x, pos_y) {
        this.circuit = circuit;
        this.value = false;
        this.pos_x = pos_x;
        this.pos_y = pos_y;
    }
    ConsumerPin.prototype.draw = function (ctx) {
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(this.pos_x, this.pos_y, ConsumerPin.radius, 0, 2 * Math.PI);
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
    function ProducerPin(pos_x, pos_y, value) {
        if (value === void 0) { value = false; }
        this.wires = [];
        this.value = value;
        this.pos_x = pos_x;
        this.pos_y = pos_y;
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
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(this.pos_x, this.pos_y, ConsumerPin.radius, 0, 2 * Math.PI);
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
    function Circuit(nConsumerPins, nProducerPins, scheduler, pos_x, pos_y, update, isInput) {
        if (pos_x === void 0) { pos_x = 0; }
        if (pos_y === void 0) { pos_y = 0; }
        if (update === void 0) { update = undefined; }
        if (isInput === void 0) { isInput = false; }
        this.scheduler = scheduler;
        this.pos_x = pos_x;
        this.pos_y = pos_y;
        if (nConsumerPins % 1 !== 0) {
            throw Error("Expected nConsumerPins to be integer but got: ".concat(nConsumerPins));
        }
        if (nProducerPins % 1 !== 0) {
            throw Error("Expected nProducerPins to be integer but got: ".concat(nProducerPins));
        }
        this.consumerPins = Array(nConsumerPins);
        for (var i = 0; i < this.consumerPins.length; i++) {
            this.consumerPins[i] = new ConsumerPin(this, this.pos_x, this.pos_y + i * 70);
        }
        this.producerPins = Array(nProducerPins);
        for (var i = 0; i < this.producerPins.length; i++) {
            this.producerPins[i] = new ProducerPin(this.pos_x + Circuit.width, this.pos_y + i * 70);
        }
        this.update = update || (function (_self) { });
        if (isInput) {
            scheduler.recurringEvents.push(this);
        }
    }
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
    };
    Circuit.width = 100;
    return Circuit;
}());
export { Circuit };
