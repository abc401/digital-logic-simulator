import { domLog, sceneManager, viewManager } from "@src/main.js";
import {
  Action,
  ActionKind,
  InteractivityManager,
  InteractivityManagerState,
  MouseButton,
  MouseMovePayload,
  ScrollPayload,
} from "../manager.js";
import { Panning } from "./panning.js";
import { Vec2, clamp } from "@src/math.js";
import { MAX_ZOOM, MIN_ZOOM } from "@src/config.js";

export function zoom(loc: Vec2, delta: Vec2) {
  let worldMouse = viewManager.screenToWorld(loc);
  viewManager.zoomLevel -= delta.y * 0.001;
  viewManager.zoomLevel = clamp(viewManager.zoomLevel, MIN_ZOOM, MAX_ZOOM);
  viewManager.panOffset = new Vec2(
    loc.x - worldMouse.x * viewManager.zoomLevel,
    loc.y - worldMouse.y * viewManager.zoomLevel
  );
}

export class Home implements InteractivityManagerState {
  constructor() {
    domLog("Home");
  }

  update(manager: InteractivityManager, action: Action): void {
    if (action.kind === ActionKind.MouseMove) {
      let payload = action.payload as MouseMovePayload;
      if (payload.buttons === MouseButton.Primary) {
        manager.state = new Panning();
      }
      return;
    }
    if (action.kind === ActionKind.Scroll) {
      let payload = action.payload as ScrollPayload;
      zoom(payload.loc, payload.delta);
    }
  }
}
