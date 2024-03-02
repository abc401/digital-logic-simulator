import { Rect } from "../../math.js";
import { ConcreteObjectKind, VirtualObject } from "../../scene-manager.js";
import { sceneManager, simEngine, viewManager } from "../../main.js";
import { SimEvent } from "../../engine.js";
import { ConsumerPin } from "../consumer-pin.js";
import { ProducerPin } from "../producer-pin.js";
export class InputCircuit {
    constructor(value, pos_x, pos_y) {
        this.value = value;
        this.rectWrl = new Rect(pos_x, pos_y, 100, 70);
        this.consumerPins = new Array();
        this.producerPins = Array(1);
        for (let i = 0; i < this.producerPins.length; i++) {
            this.producerPins[i] = new ProducerPin(this, i);
        }
        this.updateHandeler(this);
        simEngine.recurringEvents.push(new SimEvent(this, this.updateHandeler));
        sceneManager.register(new VirtualObject(ConcreteObjectKind.Circuit, this, this.rectWrl));
    }
    updateHandeler(self) {
        let self_ = self;
        self_.producerPins[0].setValue(self_.value);
    }
    // prodPinLocWrl(pinIndex: number) {
    //   return new Vec2(
    //     this.rectWrl.x + this.rectWrl.w,
    //     this.rectWrl.y + pinIndex * Circuit.pinToPinDist
    //   );
    // }
    // prodPinLocScr(pinIndex: number) {
    //   const rect = this.screenRect();
    //   return new Vec2(
    //     rect.x + rect.w,
    //     rect.y + pinIndex * Circuit.pinToPinDist * viewManager.zoomLevel
    //   );
    // }
    // conPinLocScr(pinIndex: number) {
    //   return viewManager.worldToScreen(
    //     new Vec2(this.rectWrl.x, this.rectWrl.y + pinIndex * 70)
    //   );
    //   // pos.x * zoomScale + panOffset.x,
    //   // pos.y * zoomScale + panOffset.y,
    //   // ConsumerPin.radius * zoomScale,
    //   // 0,
    //   // 2 * Math.PI
    // }
    // getVirtualObject() {
    //   return new VirtualObject(ConcreteObjectKind.Circuit, this, this.rectWrl);
    // }
    // screenRect() {
    //   return new Rect(
    //     this.rectWrl.x * viewManager.zoomLevel + viewManager.panOffset.x,
    //     this.rectWrl.y * viewManager.zoomLevel + viewManager.panOffset.y,
    //     Circuit.width * viewManager.zoomLevel,
    //     (this.consumerPins.length > this.producerPins.length
    //       ? this.consumerPins.length * 70
    //       : this.producerPins.length * 70) * viewManager.zoomLevel
    //   );
    // }
    draw(ctx) {
        for (let i = 0; i < this.consumerPins.length; i++) {
            this.consumerPins[i].draw(ctx);
        }
        for (let i = 0; i < this.producerPins.length; i++) {
            this.producerPins[i].draw(ctx);
        }
        const boundingRect = viewManager.worldToScreenRect(this.rectWrl);
        ctx.fillStyle = "cyan";
        ctx.fillRect(boundingRect.x, boundingRect.y, boundingRect.w, boundingRect.h);
    }
}
export class ProcessingCircuit {
    constructor(nConsumerPins, nProducerPins, updateHandeler, pos_x, pos_y) {
        this.updateHandeler = updateHandeler;
        this.rectWrl = new Rect(pos_x, pos_y, 100, nConsumerPins > nProducerPins ? nConsumerPins * 70 : nProducerPins * 70);
        this.producerPins = new Array(nProducerPins);
        for (let i = 0; i < nProducerPins; i++) {
            this.producerPins[i] = new ProducerPin(this, i);
        }
        this.consumerPins = new Array(nConsumerPins);
        for (let i = 0; i < nConsumerPins; i++) {
            this.consumerPins[i] = new ConsumerPin(this, i);
        }
        this.updateHandeler(this);
    }
    draw(ctx) {
        for (let i = 0; i < this.consumerPins.length; i++) {
            this.consumerPins[i].draw(ctx);
        }
        for (let i = 0; i < this.producerPins.length; i++) {
            this.producerPins[i].draw(ctx);
        }
        const boundingRect = viewManager.worldToScreenRect(this.rectWrl);
        ctx.fillStyle = "cyan";
        ctx.fillRect(boundingRect.x, boundingRect.y, boundingRect.w, boundingRect.h);
    }
}
