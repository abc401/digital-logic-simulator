import { Vec2 } from "../../../math.js";
import { sceneManager, viewManager, logState, canvas } from "../../../main.js";
import { Dragging } from "./dragging.js";
import { Panning } from "./panning.js";
import { Zooming } from "./zooming.js";
export class Home {
    constructor() {
        this.stateName = "Home";
        logState("TSHome");
    }
    touchStart(stateMachine, payload) {
        let boundingRect = canvas.getBoundingClientRect();
        if (payload.changedTouches.length === 1) {
            let touch = payload.changedTouches[0];
            let locScr = new Vec2(touch.clientX - boundingRect.x, touch.clientY - boundingRect.y);
            let focusObject = sceneManager.getObjectAt(locScr);
            if (focusObject == null) {
                stateMachine.state = new Panning(touch.identifier);
                return;
            }
            let circuit = focusObject.concreteObject;
            stateMachine.state = new Dragging(circuit, touch.identifier, circuit.rectWrl.xy.sub(viewManager.screenToWorld(locScr)));
        }
        if (payload.changedTouches.length === 2) {
            let touch1 = payload.changedTouches[0];
            let touch2 = payload.changedTouches[1];
            stateMachine.state = new Zooming(touch1.identifier, touch2.identifier);
        }
    }
    touchEnd(stateMachine, payload) { }
    touchMove(stateMachine, payload) { }
}
