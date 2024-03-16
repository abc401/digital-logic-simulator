import { MouseActionKind, } from "../state-machine.js";
import { Dragging } from "./dragging.js";
import { Panning } from "./panning.js";
import { logState, sceneManager } from "../../../main.js";
import { Vec2 } from "../../../math.js";
import { Home } from "./home.js";
import { DraggingSelection } from "./dragging-selection.js";
export class MouseDownPrimaryButton {
    constructor(circuit = undefined, offsetWrl = undefined) {
        this.circuit = circuit;
        this.offsetWrl = offsetWrl;
        logState("MouseDownPrimaryButton");
    }
    update(stateMachine, action) {
        const payload = action.payload;
        if (action.kind === MouseActionKind.MouseMove) {
            if (this.circuit == null) {
                stateMachine.state = new Panning();
                return;
            }
            else {
                if (this.offsetWrl == null) {
                    throw Error();
                }
                const locScr = new Vec2(payload.offsetX, payload.offsetY);
                if (this.circuit.isSelected) {
                    stateMachine.state = new DraggingSelection(this.circuit, this.offsetWrl, locScr);
                    return;
                }
                if (!payload.ctrlKey) {
                    sceneManager.clearSelectedCircuits();
                }
                sceneManager.selectCircuit(this.circuit);
                stateMachine.state = new Dragging(this.circuit, this.offsetWrl, locScr);
            }
        }
        if (action.kind === MouseActionKind.MouseUp) {
            if (!payload.ctrlKey) {
                sceneManager.clearSelectedCircuits();
            }
            if (this.circuit != null) {
                if (this.circuit.isSelected) {
                    sceneManager.deselectCircuit(this.circuit);
                }
                else {
                    sceneManager.selectCircuit(this.circuit);
                }
            }
            stateMachine.state = new Home();
            return;
        }
    }
}
