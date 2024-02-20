import { logState } from "@src/main.js";
import {
  TouchAction,
  TouchActionKind,
  TouchScreenState,
  TouchScreenStateMachine,
  discriminateTouches,
  getAppropriateState,
} from "../state-machine.js";

export class TouchOutsideCanvas implements TouchScreenState {
  constructor() {
    logState("TouchOutsideCanvas");
  }
  update(stateMachine: TouchScreenStateMachine, action: TouchAction): void {
    const payload = action.payload;

    if (action.kind === TouchActionKind.TouchEnd) {
      const [insideOfCanvas, outsideOfCanvas] = discriminateTouches(
        payload.touches
      );
      if (outsideOfCanvas.length !== 0) {
        return;
      }

      stateMachine.state = getAppropriateState(payload.touches);
    }
  }
}
