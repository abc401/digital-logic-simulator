import { logState, viewManager } from "@src/main.js";
import {
  MouseAction,
  MouseActionKind,
  MouseStateMachine,
  MouseState,
  MouseButton,
} from "@src/interactivity/mouse/state-machine.js";
import { Home } from "./home.js";
import { Vec2 } from "@src/math.js";

export class Panning implements MouseState {
  constructor() {
    logState("Panning");
  }

  update(stateMachine: MouseStateMachine, action: MouseAction) {
    const payload = action.payload;

    if (action.kind === MouseActionKind.MouseUp) {
      if (payload.buttonEncoded !== MouseButton.Primary) {
        return;
      }
      stateMachine.state = new Home();
    }
    if (action.kind === MouseActionKind.MouseMove) {
      const delta = new Vec2(payload.movementX, payload.movementY);
      viewManager.pan(delta);
    }
  }
}
