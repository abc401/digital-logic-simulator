"use strict";
var Wire = /** @class */ (function () {
    function Wire(from, fromPinNumber, to, toPinNumber) {
        this.producerCircuit = from;
        this.producerPinNumber = fromPinNumber;
        from.producerPins[fromPinNumber].wires.push(this);
        this.consumerCircuit = to;
        this.consumerPinNumber = toPinNumber;
    }
    Wire.prototype.propogateValue = function (value) {
        this.consumerCircuit.consumerPins[this.consumerPinNumber].consumeValue(value);
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
var ConsumerPin = /** @class */ (function () {
    function ConsumerPin(circuit, pos_x, pos_y) {
        this.circuit = circuit;
        this.value = false;
        this.pos_x = pos_x;
        this.pos_y = pos_y;
    }
    ConsumerPin.prototype.consumeValue = function (value) {
        this.value = value;
        this.circuit.func(this.circuit);
    };
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
var CircuitRunMethod;
(function (CircuitRunMethod) {
    CircuitRunMethod[CircuitRunMethod["OnInputChange"] = 0] = "OnInputChange";
    CircuitRunMethod[CircuitRunMethod["Interval"] = 1] = "Interval";
})(CircuitRunMethod || (CircuitRunMethod = {}));
var Circuit = /** @class */ (function () {
    function Circuit(nConsumerPins, nProducerPins, pos_x, pos_y, runMethod, func) {
        var _this = this;
        if (pos_x === void 0) { pos_x = 0; }
        if (pos_y === void 0) { pos_y = 0; }
        if (runMethod === void 0) { runMethod = CircuitRunMethod.OnInputChange; }
        if (func === void 0) { func = undefined; }
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
        this.func = func || (function (_self) { });
        if (runMethod === CircuitRunMethod.Interval && this.func != null) {
            setInterval(function () {
                _this.func(_this);
            }, 1000);
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
var Clock1 = new Circuit(0, 1, 30, 30, CircuitRunMethod.Interval, function (self) {
    self.producerPins[0].setValue(!self.producerPins[0].value);
});
var Or = new Circuit(2, 1, 300, 30, CircuitRunMethod.OnInputChange, function (self) {
    self.producerPins[0].setValue(self.consumerPins[0].value || self.consumerPins[1].value);
});
var Not = new Circuit(1, 1, 150, 100, CircuitRunMethod.OnInputChange, function (self) {
    self.producerPins[0].setValue(!self.consumerPins[0].value);
});
var circuits = [Clock1, Or, Not];
var wires = [
    new Wire(Clock1, 0, Or, 0),
    new Wire(Clock1, 0, Not, 0),
    new Wire(Not, 0, Or, 1),
];
function draw(ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    for (var i = 0; i < wires.length; i++) {
        wires[i].draw(ctx);
    }
    for (var i = 0; i < circuits.length; i++) {
        circuits[i].draw(ctx);
    }
    console.log("draw");
}
var canvas = document.getElementById("main-canvas");
if (canvas == null) {
    throw Error("The dom does not contain a canvas");
}
var ctx;
if (canvas.getContext("2d") != null) {
    ctx = canvas.getContext("2d");
}
else {
    throw Error("Could not get 2d context from canvas");
}
// document.addEventListener("click", () => draw(ctx));
setInterval(function () {
    draw(ctx);
}, 100);
