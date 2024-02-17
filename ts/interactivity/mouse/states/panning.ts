import { logState, viewManager } from "@src/main.js";
import {
  MouseAction,
  MouseActionKind,
  MouseStateMachine,
  MouseState,
  MouseButton,
  MouseMovePayload,
  MouseUpPayload,
  MouseDownPayload,
} from "@src/interactivity/mouse/state-machine.js";
import { Home } from "./home.js";

export class Panning implements MouseState {
  constructor() {
    logState("Panning");
  }

  mouseUp(manager: MouseStateMachine, payload: MouseUpPayload): void {
    if (payload.button !== MouseButton.Primary) {
      return;
    }
    manager.state = new Home();
  }

  mouseMove(manager: MouseStateMachine, payload: MouseMovePayload): void {
    viewManager.pan(payload.deltaScr);
  }

  mouseDown(manager: MouseStateMachine, payload: MouseDownPayload): void {}
}
