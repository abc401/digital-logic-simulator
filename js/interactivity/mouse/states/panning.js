import { logState, viewManager } from "../../../main.js";
import { MouseButton, } from "../../../interactivity/mouse/state-machine.js";
import { Home } from "./home.js";
export class Panning {
    constructor() {
        logState("Panning");
    }
    mouseUp(manager, payload) {
        if (payload.button !== MouseButton.Primary) {
            return;
        }
        manager.state = new Home();
    }
    mouseMove(manager, payload) {
        viewManager.pan(payload.deltaScr);
    }
    mouseDown(manager, payload) { }
}
