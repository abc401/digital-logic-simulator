import { MouseActionKind, } from "../state-machine.js";
import { logState, sceneManager, touchScreenStateMachine, viewManager, } from "../../../main.js";
import { Home as MouseHome } from "./home.js";
import { Home as TouchScreenHome } from "../../../interactivity/touchscreen/states/home.js";
import { Vec2 } from "../../../math.js";
export class CreatingCircuit {
    constructor(name, creator) {
        this.name = name;
        this.creator = creator;
        logState(`CreatingCircuit(${this.name})`);
    }
    update(stateMachine, action) {
        const payload = action.payload;
        const locScr = new Vec2(payload.offsetX, payload.offsetY);
        if (action.kind === MouseActionKind.MouseUp) {
            let circuit = this.creator();
            circuit.configSceneObject(viewManager.screenToWorld(locScr));
            console.log(`Created ${this.name}`);
            console.log("scene: ", sceneManager.currentScene);
            stateMachine.state = new MouseHome();
            touchScreenStateMachine.state = new TouchScreenHome();
        }
    }
}
