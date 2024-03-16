import { logState, sceneManager, viewManager } from "../../../main.js";
import { MouseActionKind, MouseButton, } from "../state-machine.js";
import { ConcreteObjectKind, } from "../../../scene/scene-manager.js";
import { Wire } from "../../../scene/objects/wire.js";
import { Vec2 } from "../../../math.js";
import { CreatingWire } from "./creating-wire.js";
import { MouseDownPrimaryButton } from "./mouse-down-primary-button.js";
export class Home {
    constructor() {
        logState("Home");
    }
    update(stateMachine, action) {
        const payload = action.payload;
        const locScr = new Vec2(payload.offsetX, payload.offsetY);
        if (action.kind === MouseActionKind.MouseDown) {
            if (payload.buttonEncoded !== MouseButton.Primary) {
                return;
            }
            let focusObject = sceneManager.getObjectAt(locScr);
            if (focusObject == null) {
                console.log("Focus Object == null");
                stateMachine.state = new MouseDownPrimaryButton();
                return;
            }
            console.log("Focus Object kind: ", focusObject.kind);
            if (focusObject.kind === ConcreteObjectKind.Circuit) {
                const circuit = focusObject.object;
                if (circuit.sceneObject == null) {
                    throw Error();
                }
                stateMachine.state = new MouseDownPrimaryButton(circuit.sceneObject, circuit.sceneObject.tightRectWrl.xy.sub(viewManager.screenToWorld(locScr)));
                return;
            }
            if (focusObject.kind === ConcreteObjectKind.ProducerPin) {
                const pin = focusObject.object;
                const wire = new Wire(pin, undefined);
                wire.toScr = locScr;
                stateMachine.state = new CreatingWire(wire);
                return;
            }
            if (focusObject.kind === ConcreteObjectKind.ConsumerPin) {
                const pin = focusObject.object;
                if (pin.wire != null) {
                    pin.wire.detach();
                }
                const wire = new Wire(undefined, pin);
                wire.fromScr = locScr;
                stateMachine.state = new CreatingWire(wire);
                return;
            }
        }
    }
}
