import { TouchActionKind, discriminateTouches, } from "../state-machine.js";
import { Vec2 } from "../../../math.js";
import { sceneManager, viewManager, logState, canvas, } from "../../../main.js";
import { Dragging } from "./dragging.js";
import { Panning } from "./panning.js";
import { Zooming } from "./zooming.js";
import { ConcreteObjectKind } from "../../../scene-manager.js";
import { TouchOutsideCanvas } from "./touch-outside-canvas.js";
import { TooManyTouches } from "./too-many-touches.js";
export class Home {
    constructor() {
        logState("TSHome");
    }
    update(stateMachine, action) {
        const payload = action.payload;
        const [insideOfCanvas, outsideOfCanvas] = discriminateTouches(payload.changedTouches);
        if (outsideOfCanvas.length > 0) {
            stateMachine.state = new TouchOutsideCanvas();
            return;
        }
        let boundingRect = canvas.getBoundingClientRect();
        if (action.kind === TouchActionKind.TouchStart) {
            if (insideOfCanvas.length === 1) {
                let touch = insideOfCanvas[0];
                let locScr = new Vec2(touch.clientX - boundingRect.x, touch.clientY - boundingRect.y);
                let focusObject = sceneManager.getObjectAt(locScr);
                if (focusObject == null ||
                    (focusObject && focusObject.kind !== ConcreteObjectKind.Circuit)) {
                    stateMachine.state = new Panning(touch.identifier);
                    return;
                }
                let circuit = focusObject.concreteObject;
                stateMachine.state = new Dragging(circuit, touch.identifier, circuit.rectWrl.xy.sub(viewManager.screenToWorld(locScr)));
            }
            else if (insideOfCanvas.length === 2) {
                let touch1 = payload.changedTouches[0];
                let touch2 = payload.changedTouches[1];
                stateMachine.state = new Zooming(touch1.identifier, touch2.identifier);
            }
            else {
                stateMachine.state = new TooManyTouches();
            }
        }
    }
}
