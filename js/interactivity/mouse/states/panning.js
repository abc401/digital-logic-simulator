import { logState, viewManager } from "../../../main.js";
import { MouseActionKind, MouseButton, } from "../../../interactivity/mouse/state-machine.js";
import { Home } from "./home.js";
import { Vec2 } from "../../../math.js";
export class Panning {
    constructor() {
        logState("Panning");
    }
    update(stateMachine, action) {
        const payload = action.payload;
        if (action.kind === MouseActionKind.MouseUp) {
            if (payload.buttonEncoded !== MouseButton.Primary) {
                return;
            }
            stateMachine.state = new Home();
        }
        if (action.kind === MouseActionKind.MouseMove) {
            const delta = new Vec2(payload.movementX, payload.movementY);
            viewManager.pan(delta);
        }
    }
}
