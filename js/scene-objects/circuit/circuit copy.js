import { Rect } from "../../math.js";
import { ConcreteObjectKind, VirtualObject } from "../../scene-manager.js";
import { sceneManager, simEngine, viewManager } from "../../main.js";
import { SimEvent } from "../../engine.js";
import { ConsumerPin } from "../consumer-pin.js";
import { ProducerPin } from "../producer-pin.js";
export class Circuit {
    constructor(nConsumerPins, nProducerPins, pos_x, pos_y, update, isInput = false) {
        this.isBeingHovered = false;
        if (nConsumerPins % 1 !== 0) {
            throw Error(`Expected nConsumerPins to be integer but got: ${nConsumerPins}`);
        }
        if (nProducerPins % 1 !== 0) {
            throw Error(`Expected nProducerPins to be integer but got: ${nProducerPins}`);
        }
        this.rectWrl = new Rect(pos_x, pos_y, Circuit.width, nConsumerPins > nProducerPins ? nConsumerPins * 70 : nProducerPins * 70);
        this.consumerPins = Array(nConsumerPins);
        for (let i = 0; i < this.consumerPins.length; i++) {
            this.consumerPins[i] = new ConsumerPin(this, i);
        }
        this.producerPins = Array(nProducerPins);
        for (let i = 0; i < this.producerPins.length; i++) {
            this.producerPins[i] = new ProducerPin(this, i);
        }
        this.update = update;
        this.update(this);
        if (isInput) {
            simEngine.recurringEvents.push(new SimEvent(this, this.update));
        }
        sceneManager.register(this.getVirtualObject());
    }
    getVirtualObject() {
        return new VirtualObject(ConcreteObjectKind.Circuit, this, this.rectWrl);
    }
    screenRect() {
        return new Rect(this.rectWrl.x * viewManager.zoomLevel + viewManager.panOffset.x, this.rectWrl.y * viewManager.zoomLevel + viewManager.panOffset.y, Circuit.width * viewManager.zoomLevel, (this.consumerPins.length > this.producerPins.length
            ? this.consumerPins.length * 70
            : this.producerPins.length * 70) * viewManager.zoomLevel);
    }
    draw(ctx) {
        for (let i = 0; i < this.consumerPins.length; i++) {
            this.consumerPins[i].draw(ctx);
        }
        for (let i = 0; i < this.producerPins.length; i++) {
            this.producerPins[i].draw(ctx);
        }
        const boundingRect = this.screenRect();
        ctx.fillStyle = "cyan";
        ctx.fillRect(boundingRect.x, boundingRect.y, boundingRect.w, boundingRect.h);
        if (this.isBeingHovered) {
            ctx.strokeStyle = "black";
            ctx.lineWidth = 1;
            ctx.strokeRect(boundingRect.x, boundingRect.y, boundingRect.w, boundingRect.h);
        }
    }
}
Circuit.width = 100;
Circuit.pinToPinDist = 70;
