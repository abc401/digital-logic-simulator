import { domLog, r, sceneManager, viewManager } from "../../main.js";
import { ActionKind, MouseButton, } from "../manager.js";
import { Panning } from "./panning.js";
import { ConcreteObjectKind } from "../../scene-manager.js";
import { Dragging } from "./dragging.js";
var Home = /** @class */ (function () {
    function Home() {
        domLog("Home");
    }
    Home.prototype.update = function (manager, action) {
        if (action.kind === ActionKind.MouseDown) {
            var payload = action.payload;
            if (payload.button !== MouseButton.Primary) {
                return;
            }
            console.log("[Home] Click Location: ", payload.locScr);
            console.log("R rect: ", r.rectW);
            var focusObject = sceneManager.getObjectAt(payload.locScr);
            if (focusObject == null) {
                manager.state = new Panning();
                return;
            }
            if (focusObject.kind === ConcreteObjectKind.Circuit) {
                var circuit = focusObject.concreteObject;
                manager.state = new Dragging(circuit, circuit.rectW.xy.sub(viewManager.screenToWorld(payload.locScr)));
            }
        }
    };
    return Home;
}());
export { Home };
