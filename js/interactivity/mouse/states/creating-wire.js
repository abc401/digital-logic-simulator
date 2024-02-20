import { Home } from "./home.js";
import { logState, sceneManager } from "../../../main.js";
import { ConcreteObjectKind } from "../../../scene-manager.js";
export class CreatingWire {
    constructor(wire) {
        this.wire = wire;
        logState("CreatingWire");
        // console.log("Wire: ", wire);
        // console.log("consumerPin: ", wire.getConsumerPin()?.wire);
    }
    mouseDown(stateMachine, payload) { }
    mouseMove(stateMachine, payload) {
        if (this.wire.isProducerPinNull()) {
            this.wire.fromScr = payload.locScr;
        }
        else if (this.wire.isConsumerPinNull()) {
            this.wire.toScr = payload.locScr;
        }
    }
    mouseUp(stateMachine, payload) {
        const focusObject = sceneManager.getObjectAt(payload.locScr);
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
        console.log("Wire: ", this.wire);
        stateMachine.state = new Home();
    }
}
