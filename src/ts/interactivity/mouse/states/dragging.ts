import { Circuit } from "@src/scene-objects/circuit.js";
import {
  MouseAction,
  MouseActionKind,
  MouseStateMachine,
  MouseState,
  MouseButton,
  MouseMovePayload,
  MouseUpPayload,
  MouseDownPayload,
} from "../state-machine.js";
import { Home } from "./home.js";
import { logState, viewManager } from "@src/main.js";
import { Vec2 } from "@src/math.js";

export class Dragging implements MouseState {
  constructor(
    private circuit: Circuit,
    private draggingOffsetWrl: Vec2,
    private mouseLocScr: Vec2 | undefined = undefined
  ) {
    if (mouseLocScr == null) {
      return;
    }
    this.circuit.rectWrl.xy = viewManager
      .screenToWorld(mouseLocScr)
      .add(this.draggingOffsetWrl);
    logState("Dragging");
  }

  mouseMove(manager: MouseStateMachine, payload: MouseMovePayload): void {
    this.circuit.rectWrl.xy = viewManager
      .screenToWorld(payload.locScr)
      .add(this.draggingOffsetWrl);
  }

  mouseUp(manager: MouseStateMachine, payload: MouseUpPayload): void {
    if (payload.button !== MouseButton.Primary) {
      return;
    }
    manager.state = new Home();
  }

  mouseDown(manager: MouseStateMachine, payload: MouseDownPayload): void {}
}
