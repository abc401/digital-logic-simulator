import { Circuit } from "@src/scene/objects/circuit.js";
import {
  MouseAction,
  MouseActionKind,
  MouseState,
  MouseStateMachine,
} from "../state-machine.js";
import {
  logState,
  sceneManager,
  touchScreenStateMachine,
  viewManager,
} from "@src/main.js";
import { Home as MouseHome } from "./home.js";
import { Home as TouchScreenHome } from "@src/interactivity/touchscreen/states/home.js";
import { Vec2 } from "@src/math.js";

export class CreatingCircuit implements MouseState {
  constructor(private name: string, private creator: () => Circuit) {
    logState(`CreatingCircuit(${this.name})`);
  }

  update(stateMachine: MouseStateMachine, action: MouseAction) {
    const payload = action.payload;
    const locScr = new Vec2(payload.offsetX, payload.offsetY);

    if (action.kind === MouseActionKind.MouseUp) {
      let circuit = this.creator();

      circuit.setPos(viewManager.screenToWorld(locScr));
      console.log(`Created ${this.name}`);
      console.log("scene: ", sceneManager.currentScene);
      stateMachine.state = new MouseHome();
      touchScreenStateMachine.state = new TouchScreenHome();
    }
  }
}
