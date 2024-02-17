import { viewManager } from "../main.js";
import { Vec2, Rect } from "../math.js";
import { ConsumerPin } from "./pins/consumer.js";
import { ProducerPin } from "./pins/producer.js";
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
        return new Vec2(rect.x + rect.w, rect.y + pinIndex * viewManager.applyZoomScalar(Circuit.pinToPinDist));
    };
    Circuit.prototype.getConsumerPinPos = function (pinIndex) {
        return viewManager.worldToScreen(new Vec2(this.pos.x, this.pos.y + pinIndex * 70));
        // pos.x * zoomScale + panOffset.x,
        // pos.y * zoomScale + panOffset.y,
        // ConsumerPin.radius * zoomScale,
        // 0,
        // 2 * Math.PI
    };
    Circuit.prototype.screenRect = function () {
        return viewManager.worldToScreenRect(this.worldRect());
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
