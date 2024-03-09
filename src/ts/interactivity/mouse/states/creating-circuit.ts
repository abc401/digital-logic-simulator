import { Circuit } from "@src/scene/objects/circuit.js";
import {
  MouseDownPayload,
  MouseMovePayload,
  MouseState,
  MouseStateMachine,
  MouseUpPayload,
} from "../state-machine.js";
import { logState, touchScreenStateMachine, viewManager } from "@src/main.js";
import { Home as MouseHome } from "./home.js";
import { Home as TouchScreenHome } from "@src/interactivity/touchscreen/states/home.js";

export class CreatingCircuit implements MouseState {
  constructor(private name: string, private creator: () => Circuit) {
    logState(`CreatingCircuit(${this.name})`);
  }
  mouseDown(stateMachine: MouseStateMachine, payload: MouseDownPayload): void {}
  mouseMove(stateMachine: MouseStateMachine, payload: MouseMovePayload): void {}
  mouseUp(stateMachine: MouseStateMachine, payload: MouseUpPayload): void {
    let circuit = this.creator();

    circuit.setPos(viewManager.screenToWorld(payload.locScr));
    console.log(`Created ${this.name}`);
    stateMachine.state = new MouseHome();
    touchScreenStateMachine.state = new TouchScreenHome();
  }
}
