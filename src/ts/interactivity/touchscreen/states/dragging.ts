import { Circuit } from "@src/scene/objects/circuit.js";
import {
  TouchAction,
  TouchActionKind,
  TouchScreenState,
  TouchScreenStateMachine,
  discriminateTouches,
} from "../state-machine.js";
import { Vec2 } from "@src/math.js";
import { canvas, domLog, logState, viewManager } from "@src/main.js";
import { Home } from "./home.js";
import { Zooming } from "./zooming.js";
import { Illegal } from "./Illegal.js";

export class Dragging implements TouchScreenState {
  constructor(
    private circuit: Circuit,
    private touchId: number,
    private draggingOffsetWrl: Vec2,
    touchLocScr: Vec2 | undefined = undefined
  ) {
    logState("TSDragging");
    if (touchLocScr == null) {
      return;
    }
    this.circuit.tightRectWrl.xy = viewManager
      .screenToWorld(touchLocScr)
      .add(this.draggingOffsetWrl);
  }

  update(stateMachine: TouchScreenStateMachine, action: TouchAction): void {
    const boundingRect = canvas.getBoundingClientRect();
    const payload = action.payload;
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
      let touch = insideOfCanvas[0];
      let locScr = new Vec2(
        touch.clientX - boundingRect.x,
        touch.clientY - boundingRect.y
      );

      this.circuit.tightRectWrl.xy = viewManager
        .screenToWorld(locScr)
        .add(this.draggingOffsetWrl);
      return;
    } else if (action.kind === TouchActionKind.TouchEnd) {
      stateMachine.state = new Home();
    }
  }
}
