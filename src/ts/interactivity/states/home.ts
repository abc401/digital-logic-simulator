import { domLog, sceneManager } from "../../main.js";
import {
  Action,
  ActionKind,
  InteractivityManager,
  InteractivityManagerState,
  MouseButton,
  MouseDownPayload,
} from "../manager.js";
import { Panning } from "./panning.js";

export class Home implements InteractivityManagerState {
  constructor() {
    domLog("Home");
  }

  update(manager: InteractivityManager, action: Action): void {
    if (action.kind === ActionKind.MouseDown) {
      console.log("Mouse Down");
      let payload = action.payload as MouseDownPayload;
      if (payload.button === MouseButton.Primary) {
        let object = sceneManager.getObjectAt(payload.loc);
        if (object == null) {
          manager.state = new Panning();
        }
      }
    }
  }
}
