import { Vec2 } from "../../math.js";
import { Home } from "./states/home.js";
import { canvas, viewManager } from "../../main.js";
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
        this.payload = payload;
    }
}
export class MouseDownPayload {
    constructor(locScr, button, buttons) {
        this.locScr = locScr;
        this.button = button;
        this.buttons = buttons;
    }
}
export class MouseUpPayload {
    constructor(button, buttons, locScr) {
        this.button = button;
        this.buttons = buttons;
        this.locScr = locScr;
    }
}
export class MouseMovePayload {
    constructor(locScr, deltaScr, buttons) {
        this.locScr = locScr;
        this.deltaScr = deltaScr;
        this.buttons = buttons;
    }
}
export class MouseStateMachine {
    constructor() {
        this.state = new Home();
        canvas.addEventListener("mousedown", (ev) => {
            let payload = new MouseDownPayload(new Vec2(ev.offsetX, ev.offsetY), encodeMouseButton(ev.button), ev.buttons);
            this.state.mouseDown(this, payload);
        });
        canvas.addEventListener("mouseup", (ev) => {
            let payload = new MouseUpPayload(encodeMouseButton(ev.button), ev.buttons, new Vec2(ev.offsetX, ev.offsetY));
            this.state.mouseUp(this, payload);
        });
        canvas.addEventListener("mousemove", (ev) => {
            let payload = new MouseMovePayload(new Vec2(ev.offsetX, ev.offsetY), new Vec2(ev.movementX, ev.movementY), ev.buttons);
            this.state.mouseMove(this, payload);
        });
        canvas.addEventListener("wheel", (ev) => {
            viewManager.zoom(new Vec2(ev.offsetX, ev.offsetY), viewManager.zoomLevel - ev.deltaY * 0.001);
            ev.preventDefault();
        });
    }
}
