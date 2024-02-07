import { domLog, viewManager } from "@src/main.js";
import {
  Action,
  ActionKind,
  InteractivityManager,
  InteractivityManagerState,
  MouseButton,
  MouseMovePayload,
  MouseUpPayload,
  ScrollPayload,
} from "@src/interactivity/manager.js";
import { Home, zoom } from "./home.js";
import { MAX_ZOOM, MIN_ZOOM } from "@src/config.js";
import { Vec2, clamp } from "@src/math.js";

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
      viewManager.pan(payload.movement);
      return;
    }
    // if (action.kind === ActionKind.Scroll) {
    //   domLog("Panning + Zooming");
    //   let payload = action.payload as ScrollPayload;
    //   zoom(payload.loc, payload.delta);
    // }
  }
}
