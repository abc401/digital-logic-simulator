import { Circuit } from "@src/scene/objects/circuit.js";
import {
  MouseAction,
  MouseActionKind,
  MouseStateMachine,
  MouseState,
  MouseButton,
} from "../state-machine.js";
import { Home } from "./home.js";
import { logState, viewManager } from "@src/main.js";
import { Vec2 } from "@src/math.js";

export class Dragging implements MouseState {
  constructor(
    private circuit: Circuit,
    private draggingOffsetWrl: Vec2,
    private mouseLocScr: Vec2 | undefined = undefined
  ) {
    if (mouseLocScr == null) {
      return;
    }

    if (this.circuit.sceneObject == null) {
      throw Error();
    }
    this.circuit.sceneObject.setPos(
      viewManager.screenToWorld(mouseLocScr).add(this.draggingOffsetWrl)
    );
    logState("Dragging");
  }

  update(stateMachine: MouseStateMachine, action: MouseAction) {
    const payload = action.payload;
    const locScr = new Vec2(payload.offsetX, payload.offsetY);

    if (action.kind === MouseActionKind.MouseMove) {
      if (this.circuit.sceneObject == null) {
        throw Error();
      }
      this.circuit.sceneObject.setPos(
        viewManager.screenToWorld(locScr).add(this.draggingOffsetWrl)
      );
    }
    if (action.kind === MouseActionKind.MouseUp) {
      if (payload.buttonEncoded !== MouseButton.Primary) {
        return;
      }
      stateMachine.state = new Home();
    }
  }
}
