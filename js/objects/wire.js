import { viewManager } from "../main.js";
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
        ctx.lineWidth = viewManager.applyZoomScalar(10);
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.closePath();
        ctx.stroke();
    };
    return Wire;
}());
export { Wire };
