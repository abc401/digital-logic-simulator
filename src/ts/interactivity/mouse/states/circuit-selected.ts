import { Circuit } from "@src/scene/objects/circuit.js";
import {
  MouseAction,
  MouseActionKind,
  MouseState,
  MouseStateMachine,
} from "../state-machine.js";
import { Dragging } from "./dragging.js";
import { Vec2 } from "@src/math.js";
import { Home } from "./home.js";
import { domLog, logState } from "@src/main.js";

export class CircuitSelected implements MouseState {
  constructor(private circuit: Circuit, private offsetWrl: Vec2) {
    logState("CircuitSelected");
  }
  update(stateMachine: MouseStateMachine, action: MouseAction) {
    const payload = action.payload;
    const locScr = new Vec2(payload.offsetX, payload.offsetY);

    if (action.kind === MouseActionKind.MouseMove) {
      stateMachine.state = new Dragging(this.circuit, this.offsetWrl, locScr);
    }
    if (action.kind === MouseActionKind.MouseUp) {
      this.circuit.onClicked();
      stateMachine.state = new Home();
    }
  }
}
