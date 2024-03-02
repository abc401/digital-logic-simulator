import { canvas, logState, mouseStateMachine, viewManager, } from "../../../main.js";
import { TouchActionKind, discriminateTouches, } from "../state-machine.js";
import { Illegal } from "./Illegal.js";
import { Vec2 } from "../../../math.js";
import { Home as TouchScreenHome } from "./home.js";
import { Home as MouseHome } from "../../../interactivity/mouse/states/home.js";
export class CreatingCircuit {
    constructor(name, creator) {
        this.name = name;
        this.creator = creator;
        logState(`CreatingCircuit(${this.name})`);
    }
    update(stateMachine, action) {
        const payload = action.payload;
        const boundingRect = canvas.getBoundingClientRect();
        const [insideOfCanvas, outsideOfCanvas] = discriminateTouches(payload.changedTouches);
        if (outsideOfCanvas.length > 0) {
            stateMachine.state = new Illegal();
            return;
        }
        if (action.kind === TouchActionKind.TouchEnd) {
            const touch = payload.changedTouches[0];
            const locScr = new Vec2(touch.clientX - boundingRect.x, touch.clientY - boundingRect.y);
            const circuit = this.creator();
            circuit.rectWrl.xy = viewManager.screenToWorld(locScr);
            // domLog(`Created ${this.name}`);
            // domLog(
            //   `circuit.value: ${circuit.value}, circuit.pin.value: ${circuit.producerPins[0].value}`
            // );
            mouseStateMachine.state = new MouseHome();
            stateMachine.state = new TouchScreenHome();
        }
    }
}
