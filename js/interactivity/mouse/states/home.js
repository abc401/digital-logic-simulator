import { logState, sceneManager, viewManager } from "../../../main.js";
import { MouseButton, } from "../state-machine.js";
import { Panning } from "./panning.js";
import { ConcreteObjectKind, } from "../../../scene/scene-manager.js";
import { Wire } from "../../../scene/objects/wire.js";
import { CreatingWire } from "./creating-wire.js";
import { CircuitSelected } from "./circuit-selected.js";
export class Home {
    constructor() {
        logState("Home");
    }
    mouseDown(stateMachine, payload) {
        if (payload.button !== MouseButton.Primary) {
            return;
        }
        let focusObject = sceneManager.getObjectAt(payload.locScr);
        if (focusObject == null) {
            console.log("Focus Object == null");
            stateMachine.state = new Panning();
            return;
        }
        console.log("Focus Object kind: ", focusObject.kind);
        if (focusObject.kind === ConcreteObjectKind.Circuit) {
            let circuit = focusObject.object;
            stateMachine.state = new CircuitSelected(circuit, circuit.tightRectWrl.xy.sub(viewManager.screenToWorld(payload.locScr)));
        }
        if (focusObject.kind === ConcreteObjectKind.ProducerPin) {
            const pin = focusObject.object;
            const wire = new Wire(pin, undefined);
            wire.toScr = payload.locScr;
            stateMachine.state = new CreatingWire(wire);
            return;
        }
        if (focusObject.kind === ConcreteObjectKind.ConsumerPin) {
            const pin = focusObject.object;
            if (pin.wire != null) {
                pin.wire.detach();
            }
            const wire = new Wire(undefined, pin);
            wire.fromScr = payload.locScr;
            stateMachine.state = new CreatingWire(wire);
            return;
        }
    }
    mouseMove(manager, payload) { }
    mouseUp(manager, payload) { }
}
