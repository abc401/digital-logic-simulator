import { logState } from "../../../main.js";
import { discriminateTouches, getAppropriateState, } from "../state-machine.js";
export class Illegal {
    constructor() {
        logState("Illegal");
    }
    update(stateMachine, action) {
        const payload = action.payload;
        const [insideOfCanvas, outsideOfCanvas] = discriminateTouches(payload.touches);
        if (outsideOfCanvas.length > 0 || insideOfCanvas.length > 2) {
            return;
        }
        stateMachine.state = getAppropriateState(payload.touches);
    }
}
