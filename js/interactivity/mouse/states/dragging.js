import { MouseButton, } from "../state-machine.js";
import { Home } from "./home.js";
import { logState, viewManager } from "../../../main.js";
export class Dragging {
    constructor(circuit, draggingOffsetWrl) {
        this.circuit = circuit;
        this.draggingOffsetWrl = draggingOffsetWrl;
        logState("Dragging");
    }
    mouseMove(manager, payload) {
        this.circuit.rectWrl.xy = viewManager
            .screenToWorld(payload.locScr)
            .add(this.draggingOffsetWrl);
    }
    mouseUp(manager, payload) {
        if (payload.button !== MouseButton.Primary) {
            return;
        }
        manager.state = new Home();
    }
    mouseDown(manager, payload) { }
}
