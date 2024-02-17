import { Vec2 } from "../math.js";
import { Home } from "./states/home.js";
export var zoomLevel = 1;
export var panOffset = new Vec2(0, 0);
export var MouseButton;
(function (MouseButton) {
    MouseButton[MouseButton["Primary"] = 0] = "Primary";
    MouseButton[MouseButton["Auxiliary"] = 1] = "Auxiliary";
    MouseButton[MouseButton["Secondary"] = 2] = "Secondary";
})(MouseButton || (MouseButton = {}));
export var ActionKind;
(function (ActionKind) {
    ActionKind[ActionKind["MouseDown"] = 0] = "MouseDown";
    ActionKind[ActionKind["MouseUp"] = 1] = "MouseUp";
    ActionKind[ActionKind["MouseMove"] = 2] = "MouseMove";
    ActionKind[ActionKind["Scroll"] = 3] = "Scroll";
})(ActionKind || (ActionKind = {}));
var Action = /** @class */ (function () {
    function Action(kind, payload) {
        this.kind = kind;
        this.payload = payload;
    }
    return Action;
}());
export { Action };
var MouseDownPayload = /** @class */ (function () {
    function MouseDownPayload(loc, button, buttons) {
        this.loc = loc;
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
    function MouseMovePayload(loc, movement) {
        this.loc = loc;
        this.movement = movement;
    }
    return MouseMovePayload;
}());
export { MouseMovePayload };
var InteractivityManager = /** @class */ (function () {
    function InteractivityManager(canvas) {
        var _this = this;
        this.canvas = canvas;
        this.state = new Home();
        canvas.addEventListener("mousedown", function (ev) {
            _this.state.update(_this, new Action(ActionKind.MouseDown, new MouseDownPayload(new Vec2(ev.offsetX, ev.offsetY), ev.button, ev.buttons)));
        });
        canvas.addEventListener("mouseup", function (ev) {
            if (ev.button & ev.buttons) {
                console.log("[MouseUp] ev.button is included in ev.buttons");
            }
            _this.state.update(_this, new Action(ActionKind.MouseUp, new MouseUpPayload(ev.button, ev.buttons)));
        });
        canvas.addEventListener("mousemove", function (ev) {
            _this.state.update(_this, new Action(ActionKind.MouseMove, new MouseMovePayload(new Vec2(ev.offsetX, ev.offsetY), new Vec2(ev.movementX, ev.movementY))));
        });
    }
    return InteractivityManager;
}());
export { InteractivityManager };
