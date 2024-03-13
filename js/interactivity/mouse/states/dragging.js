import { MouseButton, } from "../state-machine.js";
import { Home } from "./home.js";
import { logState, viewManager } from "../../../main.js";
export class Dragging {
    constructor(circuit, draggingOffsetWrl, mouseLocScr = undefined) {
        this.circuit = circuit;
        this.draggingOffsetWrl = draggingOffsetWrl;
        this.mouseLocScr = mouseLocScr;
        if (mouseLocScr == null) {
            return;
        }
        this.circuit.tightRectWrl.xy = viewManager
            .screenToWorld(mouseLocScr)
            .add(this.draggingOffsetWrl);
        logState("Dragging");
    }
    mouseMove(manager, payload) {
        this.circuit.setPos(viewManager.screenToWorld(payload.locScr).add(this.draggingOffsetWrl));
    }
    mouseUp(manager, payload) {
        if (payload.button !== MouseButton.Primary) {
            return;
        }
        manager.state = new Home();
    }
    mouseDown(manager, payload) { }
}
