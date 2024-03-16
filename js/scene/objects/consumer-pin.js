import { Vec2 } from "../../math.js";
import { viewManager } from "../../main.js";
import { PIN_EXTRUSION_WRL, PIN_TO_PIN_DISTANCE_WRL } from "../../config.js";
export class ConsumerPin {
    constructor(parentCircuit, pinIndex, value = false) {
        this.parentCircuit = parentCircuit;
        this.pinIndex = pinIndex;
        this.value = value;
        // value: boolean = false;
        this.onWireAttached = () => { };
    }
    getLocWrl() {
        if (this.parentCircuit.sceneObject == null) {
            throw Error();
        }
        const rectWrl = this.parentCircuit.sceneObject.tightRectWrl;
        return new Vec2(rectWrl.x - ConsumerPin.radiusWrl, rectWrl.y +
            (ConsumerPin.radiusWrl * 2 + PIN_TO_PIN_DISTANCE_WRL) * this.pinIndex +
            ConsumerPin.radiusWrl);
    }
    getLocScr() {
        return viewManager.worldToScreen(this.getLocWrl());
    }
    attachWire(wire) {
        if (this.wire != null) {
            this.wire.detach();
        }
        this.wire = wire;
        this.onWireAttached(this.parentCircuit);
    }
    pointCollision(pointWrl) {
        const locWrl = this.getLocWrl();
        return locWrl.sub(pointWrl).mag() < ConsumerPin.radiusWrl;
    }
    draw(ctx) {
        const pos = this.getLocScr();
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, ConsumerPin.radiusWrl * viewManager.zoomLevel, 0, 2 * Math.PI);
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
    }
}
ConsumerPin.radiusWrl = PIN_EXTRUSION_WRL / 2;
