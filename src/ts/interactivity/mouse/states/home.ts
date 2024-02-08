import { logState, r, sceneManager, viewManager } from "@src/main.js";
import {
  MouseAction,
  MouseActionKind,
  MouseStateMachine,
  MouseState,
  MouseButton,
  MouseDownPayload,
} from "../state-machine.js";
import { Panning } from "./panning.js";
import { Vec2, clamp } from "@src/math.js";
import { MAX_ZOOM, MIN_ZOOM } from "@src/config.js";
import { ConcreteObjectKind } from "@src/scene-manager.js";
import { Dragging } from "./dragging.js";
import { Circuit } from "@src/circuit.js";

export class Home implements MouseState {
  constructor() {
    logState("Home");
  }

  update(manager: MouseStateMachine, action: MouseAction): void {
    if (action.kind === MouseActionKind.MouseDown) {
      let payload = action.payload as MouseDownPayload;
      if (payload.button !== MouseButton.Primary) {
        return;
      }

      console.log("[Home] Click Location: ", payload.locScr);
      console.log("R rect: ", r.rectWrl);
      let focusObject = sceneManager.getObjectAt(payload.locScr);
      if (focusObject == null) {
        manager.state = new Panning();
        return;
      }
      if (focusObject.kind === ConcreteObjectKind.Circuit) {
        let circuit = focusObject.concreteObject as Circuit;

        manager.state = new Dragging(
          circuit,
          circuit.rectWrl.xy.sub(viewManager.screenToWorld(payload.locScr))
        );
      }
    }
  }
}
