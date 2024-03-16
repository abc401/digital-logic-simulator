import { MouseActionKind, MouseButton, } from "../state-machine.js";
import { Home } from "./home.js";
import { logState, sceneManager, viewManager } from "../../../main.js";
import { Vec2 } from "../../../math.js";
export class DraggingSelection {
    constructor(focusCircuit, draggingOffsetWrl, mouseLocScr = undefined) {
        this.focusCircuit = focusCircuit;
        this.draggingOffsetWrl = draggingOffsetWrl;
        if (mouseLocScr == null) {
            return;
        }
        this.dragCircuits(mouseLocScr);
        logState("Dragging");
    }
    update(stateMachine, action) {
        const payload = action.payload;
        const locScr = new Vec2(payload.offsetX, payload.offsetY);
        if (action.kind === MouseActionKind.MouseMove) {
            this.dragCircuits(locScr);
        }
        if (action.kind === MouseActionKind.MouseUp) {
            if (payload.buttonEncoded !== MouseButton.Primary) {
                return;
            }
            stateMachine.state = new Home();
        }
    }
    dragCircuits(mouseLocScr) {
        const focusCircuitNewPositionWrl = viewManager
            .screenToWorld(mouseLocScr)
            .add(this.draggingOffsetWrl);
        const dragMovement = focusCircuitNewPositionWrl.sub(this.focusCircuit.tightRectWrl.xy);
        for (let circuit of sceneManager.selectedCircuits) {
            circuit.setPos(circuit.tightRectWrl.xy.add(dragMovement));
        }
    }
}
