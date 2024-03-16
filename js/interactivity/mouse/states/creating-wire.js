import { MouseActionKind, } from "../state-machine.js";
import { Home } from "./home.js";
import { logState, sceneManager } from "../../../main.js";
import { ConcreteObjectKind } from "../../../scene/scene-manager.js";
import { Vec2 } from "../../../math.js";
export class CreatingWire {
    constructor(wire) {
        this.wire = wire;
        logState("CreatingWire");
        // console.log("Wire: ", wire);
        // console.log("consumerPin: ", wire.getConsumerPin()?.wire);
    }
    update(stateMachine, action) {
        const payload = action.payload;
        const locScr = new Vec2(payload.offsetX, payload.offsetY);
        if (action.kind === MouseActionKind.MouseMove) {
            if (this.wire.getProducerPin() == null) {
                this.wire.fromScr = locScr;
            }
            else if (this.wire.getConsumerPin() == null) {
                this.wire.toScr = locScr;
            }
        }
        if (action.kind === MouseActionKind.MouseUp) {
            const focusObject = sceneManager.getObjectAt(locScr);
            if (focusObject == null) {
                this.wire.detach();
            }
            else if (focusObject.kind === ConcreteObjectKind.ConsumerPin &&
                this.wire.consumerPin == null) {
                this.wire.setConsumerPin(focusObject.object);
            }
            else if (focusObject.kind === ConcreteObjectKind.ProducerPin &&
                this.wire.producerPin == null) {
                this.wire.setProducerPin(focusObject.object);
            }
            else {
                this.wire.detach();
            }
            console.log("Wire: ", this.wire);
            stateMachine.state = new Home();
        }
    }
}
