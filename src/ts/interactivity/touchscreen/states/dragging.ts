import { Circuit } from "@src/circuit.js";
import {
  TouchEndPayload,
  TouchMovePayload,
  TouchScreenState,
  TouchScreenStateMachine,
  TouchStartPayload,
} from "../state-machine.js";
import { Vec2 } from "@src/math.js";
import { canvas } from "@src/canvas.js";
import { domLog, logState, viewManager } from "@src/main.js";
import { Home } from "./home.js";
import { Zooming } from "./zooming.js";

export class Dragging implements TouchScreenState {
  constructor(
    private circuit: Circuit,
    private touchId: number,
    private draggingOffsetWrl: Vec2
  ) {
    logState("TSDragging");
  }

  touchMove(
    stateMachine: TouchScreenStateMachine,
    payload: TouchMovePayload
  ): void {
    let boundingRect = canvas.getBoundingClientRect();

    if (payload.changedTouches.length !== 1) {
      domLog(
        `[TSDragging(Err)][TouchMove] payload.changedTouches.length: ${payload.changedTouches.length}`
      );
      throw Error();
    }

    let touch = payload.changedTouches[0];
    let locScr = new Vec2(
      touch.clientX - boundingRect.x,
      touch.clientY - boundingRect.y
    );

    let previousLocScr = stateMachine.touchLocHistoryScr.get(this.touchId);
    if (previousLocScr == null) {
      domLog(`[TSDragging(Err)][TouchMove] No history for touch location`);
      throw Error();
    }

    this.circuit.rectWrl.xy = viewManager
      .screenToWorld(locScr)
      .add(this.draggingOffsetWrl);
    return;
  }

  touchEnd(
    stateMachine: TouchScreenStateMachine,
    payload: TouchEndPayload
  ): void {
    if (payload.changedTouches.length !== 1) {
      domLog(
        `[TSDragging(Err)][TouchEnd] payload.changedTouches.length: ${payload.changedTouches.length}`
      );
      throw Error();
    }

    stateMachine.state = new Home();
  }

  touchStart(
    stateMachine: TouchScreenStateMachine,
    payload: TouchStartPayload
  ): void {
    if (payload.changedTouches.length === 1) {
      const touch1Id = this.touchId;
      const touch2Id = payload.changedTouches[0].identifier;
      stateMachine.state = new Zooming(touch1Id, touch2Id);
    }
  }
}
