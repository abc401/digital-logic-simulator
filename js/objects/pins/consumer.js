import { viewManager } from "../../main.js";
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
        ctx.arc(pos.x, pos.y, viewManager.applyZoomScalar(ConsumerPin.radius), 0, 2 * Math.PI);
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
export { ConsumerPin };
