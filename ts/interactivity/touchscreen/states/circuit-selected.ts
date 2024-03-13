import { Circuit } from "@src/scene/objects/circuit.js";
import {
  TouchAction,
  TouchActionKind,
  TouchScreenState,
  TouchScreenStateMachine,
  discriminateTouches,
  findTouch,
} from "../state-machine.js";
import { Dragging } from "./dragging.js";
import { Vec2 } from "@src/math.js";
import { canvas, domLog, logState } from "@src/main.js";
import { Home } from "./home.js";
import { Illegal } from "./Illegal.js";
import { Zooming } from "./zooming.js";

export class CircuitSelected implements TouchScreenState {
  constructor(
    private circuit: Circuit,
    private touchId: number,
    private offsetWrl: Vec2
  ) {
    logState("TSCircuitSelected");
  }
  update(stateMachine: TouchScreenStateMachine, action: TouchAction): void {
    const payload = action.payload;
    const boundingRect = canvas.getBoundingClientRect();
    const [insideOfCanvas, outsideOfCanvas] = discriminateTouches(
      payload.changedTouches
    );

    if (outsideOfCanvas.length > 0) {
      stateMachine.state = new Illegal();
      return;
    }
    if (action.kind === TouchActionKind.TouchStart) {
      if (insideOfCanvas.length === 1) {
        stateMachine.state = new Zooming(
          this.touchId,
          insideOfCanvas[0].identifier
        );
      } else {
        stateMachine.state = new Illegal();
      }
    }

    if (action.kind === TouchActionKind.TouchMove) {
      let touch = findTouch(this.touchId, payload.changedTouches);
      if (touch == null) {
        domLog("[CircuitSelectedErr] Some touch moved and it wasn't my touch");
        throw Error();
      }

      let locScr = new Vec2(
        touch.clientX - boundingRect.x,
        touch.clientY - boundingRect.y
      );
      payload.touches;
      stateMachine.state = new Dragging(
        this.circuit,
        this.touchId,
        this.offsetWrl,
        locScr
      );
    }
    if (action.kind === TouchActionKind.TouchEnd) {
      domLog("Invoking Circuit.onClicked");
      this.circuit.onClicked();
      // domLog(this.circuit.value);
      stateMachine.state = new Home();
    }
  }
}
