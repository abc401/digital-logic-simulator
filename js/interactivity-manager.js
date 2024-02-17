var ActionKind;
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
var InteractivityManager = /** @class */ (function () {
    function InteractivityManager(canvas) {
        this.canvas = canvas;
    }
    return InteractivityManager;
}());
export { InteractivityManager };
