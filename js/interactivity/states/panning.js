import { domLog, viewManager } from "../../main.js";
import { ActionKind, MouseButton, } from "../../interactivity/manager.js";
import { Home } from "./home.js";
var Panning = /** @class */ (function () {
    function Panning() {
        domLog("Panning");
    }
    Panning.prototype.update = function (manager, action) {
        if (action.kind === ActionKind.MouseUp) {
            var payload = action.payload;
            if (payload.button === MouseButton.Primary) {
                manager.state = new Home();
                return;
            }
        }
        if (action.kind === ActionKind.MouseMove) {
            var payload = action.payload;
            viewManager.pan(payload.deltaScr);
            return;
        }
    };
    return Panning;
}());
export { Panning };
