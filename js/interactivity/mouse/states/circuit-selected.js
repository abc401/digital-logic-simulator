import { Dragging } from "./dragging.js";
import { Home } from "./home.js";
import { logState } from "../../../main.js";
export class CircuitSelected {
    constructor(circuit, offsetWrl) {
        this.circuit = circuit;
        this.offsetWrl = offsetWrl;
        logState("CircuitSelected");
    }
    mouseDown(stateMachine, payload) { }
    mouseMove(stateMachine, payload) {
        stateMachine.state = new Dragging(this.circuit, this.offsetWrl, payload.locScr);
    }
    mouseUp(stateMachine, payload) {
        this.circuit.onClicked();
        stateMachine.state = new Home();
    }
}
