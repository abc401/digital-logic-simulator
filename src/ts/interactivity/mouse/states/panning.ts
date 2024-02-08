import { logState, viewManager } from "@src/main.js";
import {
  MouseAction,
  MouseActionKind,
  MouseStateMachine,
  MouseState,
  MouseButton,
  MouseMovePayload,
  MouseUpPayload,
} from "@src/interactivity/mouse/state-machine.js";
import { Home } from "./home.js";

export class Panning implements MouseState {
  constructor() {
    logState("Panning");
  }

  update(manager: MouseStateMachine, action: MouseAction): void {
    if (action.kind === MouseActionKind.MouseUp) {
      let payload = action.payload as MouseUpPayload;
      if (payload.button === MouseButton.Primary) {
        manager.state = new Home();
        return;
      }
    }
    if (action.kind === MouseActionKind.MouseMove) {
      let payload = action.payload as MouseMovePayload;
      viewManager.pan(payload.deltaScr);
      return;
    }
  }
}
