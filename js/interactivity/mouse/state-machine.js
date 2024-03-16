import { Vec2 } from "../../math.js";
import { Home } from "./states/home.js";
import { canvas, viewManager } from "../../main.js";
import { copySelectedToClipboard, pasteFromClipboard } from "../common.js";
export var MouseButton;
(function (MouseButton) {
    MouseButton[MouseButton["None"] = 0] = "None";
    MouseButton[MouseButton["Primary"] = 1] = "Primary";
    MouseButton[MouseButton["Secondary"] = 2] = "Secondary";
    MouseButton[MouseButton["Auxiliary"] = 4] = "Auxiliary";
    MouseButton[MouseButton["Fourth"] = 8] = "Fourth";
    MouseButton[MouseButton["Fifth"] = 16] = "Fifth";
})(MouseButton || (MouseButton = {}));
function encodeMouseButton(button) {
    if (button === 0) {
        return MouseButton.Primary;
    }
    if (button === 1) {
        return MouseButton.Auxiliary;
    }
    if (button === 2) {
        return MouseButton.Secondary;
    }
    if (button === 3) {
        return MouseButton.Fourth;
    }
    if (button === 4) {
        return MouseButton.Fifth;
    }
    throw Error(`Unexpected Mouse Button: ${button}`);
}
export var MouseActionKind;
(function (MouseActionKind) {
    MouseActionKind[MouseActionKind["MouseDown"] = 0] = "MouseDown";
    MouseActionKind[MouseActionKind["MouseUp"] = 1] = "MouseUp";
    MouseActionKind[MouseActionKind["MouseMove"] = 2] = "MouseMove";
})(MouseActionKind || (MouseActionKind = {}));
export class MouseAction {
    constructor(kind, payload) {
        this.kind = kind;
        this.payload = Object.assign(payload, {
            buttonEncoded: encodeMouseButton(payload.button),
        });
    }
}
export class MouseStateMachine {
    constructor() {
        this.state = new Home();
        document.addEventListener("keydown", (ev) => {
            if ((ev.key === "c" || ev.key === "C") && ev.ctrlKey) {
                copySelectedToClipboard();
            }
            else if ((ev.key === "v" || ev.key === "V") && ev.ctrlKey) {
                pasteFromClipboard();
            }
        });
        canvas.addEventListener("mousedown", (ev) => {
            this.state.update(this, new MouseAction(MouseActionKind.MouseDown, ev));
        });
        canvas.addEventListener("mouseup", (ev) => {
            this.state.update(this, new MouseAction(MouseActionKind.MouseUp, ev));
        });
        canvas.addEventListener("mousemove", (ev) => {
            this.state.update(this, new MouseAction(MouseActionKind.MouseMove, ev));
        });
        canvas.addEventListener("wheel", (ev) => {
            viewManager.zoom(new Vec2(ev.offsetX, ev.offsetY), viewManager.zoomLevel - ev.deltaY * 0.001);
            ev.preventDefault();
        });
    }
}
