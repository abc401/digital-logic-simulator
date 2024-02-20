import { logState } from "@src/main.js";
import {
  TouchAction,
  TouchScreenState,
  TouchScreenStateMachine,
  discriminateTouches,
  getAppropriateState,
} from "../state-machine.js";
import { TouchOutsideCanvas } from "./touch-outside-canvas.js";

export class TooManyTouches implements TouchScreenState {
  constructor() {
    logState("TooManyTouches");
  }
  update(stateMachine: TouchScreenStateMachine, action: TouchAction): void {
    const payload = action.payload;
    const [insideOfCanvas, outsideOfCanvas] = discriminateTouches(
      payload.touches
    );

    if (outsideOfCanvas.length > 0) {
      stateMachine.state = new TouchOutsideCanvas();
    } else {
      stateMachine.state = getAppropriateState(payload.touches);
    }
  }
}
