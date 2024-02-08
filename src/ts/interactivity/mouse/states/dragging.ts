import { Circuit } from "@src/circuit.js";
import {
  MouseAction,
  MouseActionKind,
  MouseStateMachine,
  MouseState,
  MouseButton,
  MouseMovePayload,
  MouseUpPayload,
} from "../state-machine.js";
import { Home } from "./home.js";
import { logState, viewManager } from "@src/main.js";
import { Vec2 } from "@src/math.js";

export class Dragging implements MouseState {
  constructor(private circuit: Circuit, private draggingOffsetWrl: Vec2) {
    logState("Dragging");
  }
  update(manager: MouseStateMachine, action: MouseAction): void {
    if (action.kind === MouseActionKind.MouseMove) {
      let payload = action.payload as MouseMovePayload;

      this.circuit.rectWrl.xy = viewManager
        .screenToWorld(payload.locScr)
        .add(this.draggingOffsetWrl);
      return;
    }
    if (action.kind === MouseActionKind.MouseUp) {
      let payload = action.payload as MouseUpPayload;
      if (payload.button !== MouseButton.Primary) {
        return;
      }
      manager.state = new Home();
    }
  }
}
