import { TouchActionKind, discriminateTouches, } from "../state-machine.js";
import { Vec2 } from "../../../math.js";
import { canvas, logState, viewManager } from "../../../main.js";
import { Home } from "./home.js";
import { Zooming } from "./zooming.js";
import { Illegal } from "./Illegal.js";
export class Dragging {
    constructor(circuit, touchId, draggingOffsetWrl, touchLocScr = undefined) {
        this.circuit = circuit;
        this.touchId = touchId;
        this.draggingOffsetWrl = draggingOffsetWrl;
        logState("TSDragging");
        if (touchLocScr == null) {
            return;
        }
        if (this.circuit.sceneObject == null) {
            throw Error();
        }
        this.circuit.sceneObject.tightRectWrl.xy = viewManager
            .screenToWorld(touchLocScr)
            .add(this.draggingOffsetWrl);
    }
    update(stateMachine, action) {
        const boundingRect = canvas.getBoundingClientRect();
        const payload = action.payload;
        const [insideOfCanvas, outsideOfCanvas] = discriminateTouches(payload.changedTouches);
        if (outsideOfCanvas.length > 0) {
            stateMachine.state = new Illegal();
        }
        if (action.kind === TouchActionKind.TouchStart) {
            if (insideOfCanvas.length === 1) {
                const touch1Id = this.touchId;
                const touch2Id = payload.changedTouches[0].identifier;
                stateMachine.state = new Zooming(touch1Id, touch2Id);
            }
            else {
                stateMachine.state = new Illegal();
            }
        }
        else if (action.kind === TouchActionKind.TouchMove) {
            let touch = insideOfCanvas[0];
            let locScr = new Vec2(touch.clientX - boundingRect.x, touch.clientY - boundingRect.y);
            if (this.circuit.sceneObject == null) {
                throw Error();
            }
            this.circuit.sceneObject.tightRectWrl.xy = viewManager
                .screenToWorld(locScr)
                .add(this.draggingOffsetWrl);
            return;
        }
        else if (action.kind === TouchActionKind.TouchEnd) {
            stateMachine.state = new Home();
        }
    }
}
