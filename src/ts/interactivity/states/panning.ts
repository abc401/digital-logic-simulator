import { domLog, viewManager } from "@src/main.js";
import {
  Action,
  ActionKind,
  InteractivityManager,
  InteractivityManagerState,
  MouseButton,
  MouseMovePayload,
  MouseUpPayload,
} from "@src/interactivity/manager.js";
import { Home } from "./home.js";

export class Panning implements InteractivityManagerState {
  constructor() {
    domLog("Panning");
  }

  update(manager: InteractivityManager, action: Action): void {
    if (action.kind === ActionKind.MouseUp) {
      let payload = action.payload as MouseUpPayload;
      if (payload.button === MouseButton.Primary) {
        manager.state = new Home();
        return;
      }
    }
    if (action.kind === ActionKind.MouseMove) {
      let payload = action.payload as MouseMovePayload;
      viewManager.pan(payload.deltaScr);
      return;
    }
  }
}
