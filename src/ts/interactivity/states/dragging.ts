import { Circuit } from "@src/circuit.js";
import {
  Action,
  ActionKind,
  InteractivityManager,
  InteractivityManagerState,
  MouseButton,
  MouseMovePayload,
  MouseUpPayload,
} from "../manager.js";
import { Home } from "./home.js";
import { domLog, viewManager } from "@src/main.js";
import { Vec2 } from "@src/math.js";

export class Dragging implements InteractivityManagerState {
  constructor(private circuit: Circuit, private draggingOffsetWrl: Vec2) {
    domLog("Dragging");
  }
  update(manager: InteractivityManager, action: Action): void {
    if (action.kind === ActionKind.MouseMove) {
      let payload = action.payload as MouseMovePayload;

      this.circuit.rectW.xy = viewManager
        .screenToWorld(payload.locScr)
        .add(this.draggingOffsetWrl);
      return;
    }
    if (action.kind === ActionKind.MouseUp) {
      let payload = action.payload as MouseUpPayload;
      if (payload.button !== MouseButton.Primary) {
        return;
      }
      manager.state = new Home();
    }
  }
}
