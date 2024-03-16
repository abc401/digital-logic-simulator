import { TouchActionKind, discriminateTouches, findTouch, } from "../state-machine.js";
import { Dragging } from "./dragging.js";
import { Vec2 } from "../../../math.js";
import { canvas, domLog, logState } from "../../../main.js";
import { Home } from "./home.js";
import { Illegal } from "./Illegal.js";
import { Zooming } from "./zooming.js";
export class CircuitSelected {
    constructor(circuit, touchId, offsetWrl) {
        this.circuit = circuit;
        this.touchId = touchId;
        this.offsetWrl = offsetWrl;
        logState("TSCircuitSelected");
    }
    update(stateMachine, action) {
        const payload = action.payload;
        const boundingRect = canvas.getBoundingClientRect();
        const [insideOfCanvas, outsideOfCanvas] = discriminateTouches(payload.changedTouches);
        if (outsideOfCanvas.length > 0) {
            stateMachine.state = new Illegal();
            return;
        }
        if (action.kind === TouchActionKind.TouchStart) {
            if (insideOfCanvas.length === 1) {
                stateMachine.state = new Zooming(this.touchId, insideOfCanvas[0].identifier);
            }
            else {
                stateMachine.state = new Illegal();
            }
        }
        if (action.kind === TouchActionKind.TouchMove) {
            let touch = findTouch(this.touchId, payload.changedTouches);
            if (touch == null) {
                domLog("[CircuitSelectedErr] Some touch moved and it wasn't my touch");
                throw Error();
            }
            let locScr = new Vec2(touch.clientX - boundingRect.x, touch.clientY - boundingRect.y);
            payload.touches;
            stateMachine.state = new Dragging(this.circuit, this.touchId, this.offsetWrl, locScr);
        }
        if (action.kind === TouchActionKind.TouchEnd) {
            domLog("Invoking Circuit.onClicked");
            if (this.circuit.sceneObject == null) {
                throw Error();
            }
            if (this.circuit.sceneObject.onClicked != null) {
                this.circuit.sceneObject.onClicked(this.circuit);
            }
            // domLog(this.circuit.value);
            stateMachine.state = new Home();
        }
    }
}
