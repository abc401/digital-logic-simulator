import { logState, sceneManager, touchScreenStateMachine, viewManager, } from "../../../main.js";
import { Home as MouseHome } from "./home.js";
import { Home as TouchScreenHome } from "../../../interactivity/touchscreen/states/home.js";
export class CreatingCircuit {
    constructor(name, creator) {
        this.name = name;
        this.creator = creator;
        logState(`CreatingCircuit(${this.name})`);
    }
    mouseDown(stateMachine, payload) { }
    mouseMove(stateMachine, payload) { }
    mouseUp(stateMachine, payload) {
        let circuit = this.creator();
        circuit.setPos(viewManager.screenToWorld(payload.locScr));
        console.log(`Created ${this.name}`);
        console.log("scene: ", sceneManager.currentScene);
        stateMachine.state = new MouseHome();
        touchScreenStateMachine.state = new TouchScreenHome();
    }
}
