import { viewManager } from "../../main.js";
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
        ctx.arc(pos.x, pos.y, viewManager.applyZoomScalar(ProducerPin.radius), 0, 2 * Math.PI);
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
export { ProducerPin };
