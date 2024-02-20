import { logState } from "../../../main.js";
import { discriminateTouches, getAppropriateState, } from "../state-machine.js";
import { TouchOutsideCanvas } from "./touch-outside-canvas.js";
export class TooManyTouches {
    constructor() {
        logState("TooManyTouches");
    }
    update(stateMachine, action) {
        const payload = action.payload;
        const [insideOfCanvas, outsideOfCanvas] = discriminateTouches(payload.touches);
        if (outsideOfCanvas.length > 0) {
            stateMachine.state = new TouchOutsideCanvas();
        }
        else {
            stateMachine.state = getAppropriateState(payload.touches);
        }
    }
}
