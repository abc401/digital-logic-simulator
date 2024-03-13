import { Circuit } from "@src/scene/objects/circuit.js";
import {
  MouseDownPayload,
  MouseMovePayload,
  MouseState,
  MouseStateMachine,
  MouseUpPayload,
} from "../state-machine.js";
import { Dragging } from "./dragging.js";
import { Vec2 } from "@src/math.js";
import { Home } from "./home.js";
import { domLog, logState } from "@src/main.js";

export class CircuitSelected implements MouseState {
  constructor(private circuit: Circuit, private offsetWrl: Vec2) {
    logState("CircuitSelected");
  }
  mouseDown(stateMachine: MouseStateMachine, payload: MouseDownPayload): void {}

  mouseMove(stateMachine: MouseStateMachine, payload: MouseMovePayload): void {
    stateMachine.state = new Dragging(
      this.circuit,
      this.offsetWrl,
      payload.locScr
    );
  }

  mouseUp(stateMachine: MouseStateMachine, payload: MouseUpPayload): void {
    this.circuit.onClicked();
    stateMachine.state = new Home();
  }
}
