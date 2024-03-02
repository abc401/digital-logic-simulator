import { TouchActionKind, discriminateTouches, } from "../state-machine.js";
import { Illegal } from "./Illegal.js";
import { canvas, sceneManager } from "../../../main.js";
import { Vec2 } from "../../../math.js";
import { ConcreteObjectKind } from "../../../scene-manager.js";
import { Home } from "./home.js";
export class CreatingWire {
    constructor(wire) {
        this.wire = wire;
    }
    update(stateMachine, action) {
        const payload = action.payload;
        const [insideOfCanvas, outsideOfCanvas] = discriminateTouches(payload.changedTouches);
        let boundingRect = canvas.getBoundingClientRect();
        if (outsideOfCanvas.length > 0 ||
            action.kind === TouchActionKind.TouchStart) {
            this.wire.detach();
            stateMachine.state = new Illegal();
            return;
        }
        const touch = payload.changedTouches[0];
        const locScr = new Vec2(touch.clientX - boundingRect.x, touch.clientY - boundingRect.y);
        if (action.kind === TouchActionKind.TouchMove) {
            if (this.wire.isProducerPinNull()) {
                this.wire.fromScr = locScr;
            }
            else if (this.wire.isConsumerPinNull()) {
                this.wire.toScr = locScr;
            }
        }
        if (action.kind === TouchActionKind.TouchEnd) {
            const focusObject = sceneManager.getObjectAt(locScr);
            if (focusObject == null) {
                this.wire.detach();
            }
            else if (focusObject.kind === ConcreteObjectKind.ConsumerPin &&
                this.wire.isConsumerPinNull()) {
                this.wire.setConsumerPin(focusObject.concreteObject);
            }
            else if (focusObject.kind === ConcreteObjectKind.ProducerPin &&
                this.wire.isProducerPinNull()) {
                this.wire.setProducerPin(focusObject.concreteObject);
            }
            else {
                this.wire.detach();
            }
            stateMachine.state = new Home();
        }
    }
}
