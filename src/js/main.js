"use strict";
var Wire = /** @class */ (function () {
    function Wire(from, to) {
        this.from = from;
        this.to = to;
    }
    Wire.prototype.propogateValue = function (value) {
        this.to.consumeValue(value);
    };
    return Wire;
}());
var ConsumerPin = /** @class */ (function () {
    function ConsumerPin(wire) {
        if (wire === void 0) { wire = undefined; }
        this.wire = wire;
        this.value = false;
    }
    ConsumerPin.prototype.consumeValue = function (value) {
        this.value = value;
    };
    ConsumerPin.prototype.draw = function (ctx, x, y, radius) {
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        if (this.value) {
            ctx.fillStyle = "red";
            ctx.fill();
        }
        else {
            ctx.lineWidth = 1;
            ctx.strokeStyle = "red";
            ctx.stroke();
        }
    };
    return ConsumerPin;
}());
var ProducerPin = /** @class */ (function () {
    function ProducerPin(wire) {
        if (wire === void 0) { wire = undefined; }
        this.wire = wire;
        this.value = false;
    }
    ProducerPin.prototype.setValue = function (value) {
        this.value = value;
        if (this.wire) {
            this.wire.propogateValue(value);
        }
    };
    ProducerPin.prototype.draw = function (ctx, x, y, radius) {
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        if (this.value) {
            ctx.fillStyle = "red";
            ctx.fill();
        }
        else {
            ctx.lineWidth = 1;
            ctx.strokeStyle = "red";
            ctx.stroke();
        }
    };
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
        if (nConsumerPins % 1 !== 0) {
            throw Error("Expected nConsumerPins to be integer but got: ".concat(nConsumerPins));
        }
        if (nProducerPins % 1 !== 0) {
            throw Error("Expected nProducerPins to be integer but got: ".concat(nProducerPins));
        }
        this.consumerPins = Array(nConsumerPins);
        for (var i = 0; i < this.consumerPins.length; i++) {
            this.consumerPins[i] = new ConsumerPin();
        }
        this.producerPins = Array(nProducerPins);
        for (var i = 0; i < this.producerPins.length; i++) {
            this.producerPins[i] = new ProducerPin();
        }
        this.func = func || (function (self) { });
        this.pos_x = pos_x;
        this.pos_y = pos_y;
        if (runMethod === CircuitRunMethod.Interval && this.func != null) {
            setInterval(function () {
                _this.func(_this);
            }, 1000);
        }
    }
    Circuit.prototype.draw = function (ctx) {
        ctx.fillStyle = "cyan";
        ctx.fillRect(this.pos_x, this.pos_y, Circuit.width, this.consumerPins.length > this.producerPins.length
            ? this.consumerPins.length * 70
            : this.producerPins.length * 70);
        for (var i = 0; i < this.consumerPins.length; i++) {
            this.consumerPins[i].draw(ctx, this.pos_x, this.pos_y + i * 70, 10);
        }
        for (var i = 0; i < this.producerPins.length; i++) {
            this.producerPins[i].draw(ctx, this.pos_x + Circuit.width, this.pos_y + i * 70, 10);
        }
    };
    Circuit.width = 100;
    return Circuit;
}());
var Clock = new Circuit(0, 1, 30, 30, CircuitRunMethod.Interval, function (self) {
    self.producerPins[0].setValue(!self.producerPins[0].value);
});
var OutputDisplay = new Circuit(1, 0, 200, 30);
var wire = new Wire(Clock.producerPins[0], OutputDisplay.consumerPins[0]);
Clock.producerPins[0].wire = wire;
OutputDisplay.consumerPins[0].wire = wire;
function draw(ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    Clock.draw(ctx);
    OutputDisplay.draw(ctx);
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
