import {
  TouchAction,
  TouchActionKind,
  TouchScreenState,
  TouchScreenStateMachine,
  discriminateTouches,
} from "../state-machine.js";
import { canvas, domLog, logState, viewManager } from "@src/main.js";
import { Vec2 } from "@src/math.js";
import { Home } from "./home.js";
import { Zooming } from "./zooming.js";
import { Illegal } from "./Illegal.js";

export class Panning implements TouchScreenState {
  constructor(readonly touchId: number) {
    logState("TSPanning");
  }
  update(stateMachine: TouchScreenStateMachine, action: TouchAction): void {
    const payload = action.payload;
    const boundingRect = canvas.getBoundingClientRect();
    const [insideOfCanvas, outsideOfCanvas] = discriminateTouches(
      payload.changedTouches
    );

    if (outsideOfCanvas.length > 0) {
      stateMachine.state = new Illegal();
    }

    if (action.kind === TouchActionKind.TouchStart) {
      if (insideOfCanvas.length === 1) {
        const touch1Id = this.touchId;
        const touch2Id = payload.changedTouches[0].identifier;
        stateMachine.state = new Zooming(touch1Id, touch2Id);
      } else {
        stateMachine.state = new Illegal();
      }
    } else if (action.kind === TouchActionKind.TouchMove) {
      let touch = payload.changedTouches[0];
      let locScr = new Vec2(
        touch.clientX - boundingRect.x,
        touch.clientY - boundingRect.y
      );

      let previousLocScr = stateMachine.touchLocHistoryScr.get(this.touchId);
      if (previousLocScr == null) {
        domLog(`[TSPanning(Err)][TouchMove] No history for touch location`);
        throw Error();
      }

      viewManager.pan(locScr.sub(previousLocScr));
    } else if (action.kind === TouchActionKind.TouchEnd) {
      stateMachine.state = new Home();
    }
  }
}
