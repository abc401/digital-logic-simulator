import { Circuit } from "@src/scene/objects/circuit.js";
import {
  MouseAction,
  MouseActionKind,
  MouseState,
  MouseStateMachine,
} from "../state-machine.js";
import { Dragging } from "./dragging.js";
import { Panning } from "./panning.js";
import { logState, sceneManager } from "@src/main.js";
import { Vec2 } from "@src/math.js";
import { Home } from "./home.js";

export class MouseDownPrimaryButton implements MouseState {
  constructor(
    private circuit: Circuit | undefined = undefined,
    private offsetWrl: Vec2 | undefined = undefined
  ) {
    logState("MouseDownPrimaryButton");
  }

  update(stateMachine: MouseStateMachine, action: MouseAction): void {
    const payload = action.payload;
    if (action.kind === MouseActionKind.MouseMove) {
      if (this.circuit == null) {
        stateMachine.state = new Panning();
        return;
      } else {
        if (this.offsetWrl == null) {
          throw Error();
        }

        const locScr = new Vec2(payload.offsetX, payload.offsetY);

        if (!payload.ctrlKey) {
          sceneManager.clearSelectedCircuits();
        }
        sceneManager.selectCircuit(this.circuit.id);
        stateMachine.state = new Dragging(this.circuit, this.offsetWrl, locScr);
      }
    }
    if (action.kind === MouseActionKind.MouseUp) {
      if (!payload.ctrlKey) {
        sceneManager.clearSelectedCircuits();
      }
      if (this.circuit != null) {
        if (this.circuit.isSelected) {
          sceneManager.deselectCircuit(this.circuit.id);
        } else {
          sceneManager.selectCircuit(this.circuit.id);
        }
      }
      stateMachine.state = new Home();
      return;
    }
  }
}
