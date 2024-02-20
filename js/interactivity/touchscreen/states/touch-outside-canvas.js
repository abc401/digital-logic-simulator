import { logState } from "../../../main.js";
import { TouchActionKind, discriminateTouches, getAppropriateState, } from "../state-machine.js";
export class TouchOutsideCanvas {
    constructor() {
        logState("TouchOutsideCanvas");
    }
    update(stateMachine, action) {
        const payload = action.payload;
        if (action.kind === TouchActionKind.TouchEnd) {
            const [insideOfCanvas, outsideOfCanvas] = discriminateTouches(payload.touches);
            if (outsideOfCanvas.length !== 0) {
                return;
            }
            stateMachine.state = getAppropriateState(payload.touches);
        }
    }
}
