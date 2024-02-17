import { Vec2 } from "../../math.js";
import { Home } from "./states/home.js";
import { viewManager } from "../../main.js";
import { canvas } from "../../canvas.js";
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
    throw Error("Unexpected Mouse Button: ".concat(button));
}
export var MouseActionKind;
(function (MouseActionKind) {
    MouseActionKind[MouseActionKind["MouseDown"] = 0] = "MouseDown";
    MouseActionKind[MouseActionKind["MouseUp"] = 1] = "MouseUp";
    MouseActionKind[MouseActionKind["MouseMove"] = 2] = "MouseMove";
    MouseActionKind[MouseActionKind["Scroll"] = 3] = "Scroll";
})(MouseActionKind || (MouseActionKind = {}));
var MouseAction = /** @class */ (function () {
    function MouseAction(kind, payload) {
        this.kind = kind;
        this.payload = payload;
    }
    return MouseAction;
}());
export { MouseAction };
var MouseDownPayload = /** @class */ (function () {
    function MouseDownPayload(locScr, button, buttons) {
        this.locScr = locScr;
        this.button = button;
        this.buttons = buttons;
    }
    return MouseDownPayload;
}());
export { MouseDownPayload };
var MouseUpPayload = /** @class */ (function () {
    function MouseUpPayload(button, buttons) {
        this.button = button;
        this.buttons = buttons;
    }
    return MouseUpPayload;
}());
export { MouseUpPayload };
var MouseMovePayload = /** @class */ (function () {
    function MouseMovePayload(locScr, deltaScr, buttons) {
        this.locScr = locScr;
        this.deltaScr = deltaScr;
        this.buttons = buttons;
    }
    return MouseMovePayload;
}());
export { MouseMovePayload };
var MouseStateMachine = /** @class */ (function () {
    function MouseStateMachine() {
        var _this = this;
        this.state = new Home();
        canvas.addEventListener("mousedown", function (ev) {
            var payload = new MouseDownPayload(new Vec2(ev.offsetX, ev.offsetY), encodeMouseButton(ev.button), ev.buttons);
            _this.state.update(_this, new MouseAction(MouseActionKind.MouseDown, payload));
        });
        canvas.addEventListener("mouseup", function (ev) {
            var payload = new MouseUpPayload(encodeMouseButton(ev.button), ev.buttons);
            _this.state.update(_this, new MouseAction(MouseActionKind.MouseUp, payload));
        });
        canvas.addEventListener("mousemove", function (ev) {
            var payload = new MouseMovePayload(new Vec2(ev.offsetX, ev.offsetY), new Vec2(ev.movementX, ev.movementY), ev.buttons);
            _this.state.update(_this, new MouseAction(MouseActionKind.MouseMove, payload));
        });
        canvas.addEventListener("wheel", function (ev) {
            viewManager.zoom(new Vec2(ev.offsetX, ev.offsetY), viewManager.zoomLevel - ev.deltaY * 0.001);
            ev.preventDefault();
        });
    }
    return MouseStateMachine;
}());
export { MouseStateMachine };
