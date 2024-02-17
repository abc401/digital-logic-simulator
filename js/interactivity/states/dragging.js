import { ActionKind, MouseButton, } from "../manager.js";
import { Home } from "./home.js";
import { domLog, viewManager } from "../../main.js";
var Dragging = /** @class */ (function () {
    function Dragging(circuit, draggingOffsetWrl) {
        this.circuit = circuit;
        this.draggingOffsetWrl = draggingOffsetWrl;
        domLog("Dragging");
    }
    Dragging.prototype.update = function (manager, action) {
        if (action.kind === ActionKind.MouseMove) {
            var payload = action.payload;
            this.circuit.rectW.xy = viewManager
                .screenToWorld(payload.locScr)
                .add(this.draggingOffsetWrl);
            return;
        }
        if (action.kind === ActionKind.MouseUp) {
            var payload = action.payload;
            if (payload.button !== MouseButton.Primary) {
                return;
            }
            manager.state = new Home();
        }
    };
    return Dragging;
}());
export { Dragging };
