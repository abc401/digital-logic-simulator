import { canvas } from "../../canvas.js";
import { domLog, sceneManager, viewManager } from "../../main.js";
import { Vec2 } from "../../math.js";
var TSActionKind;
(function (TSActionKind) {
    TSActionKind[TSActionKind["TouchStart"] = 0] = "TouchStart";
    TSActionKind[TSActionKind["TouchEnd"] = 1] = "TouchEnd";
    TSActionKind[TSActionKind["TouchMove"] = 2] = "TouchMove";
})(TSActionKind || (TSActionKind = {}));
var TouchScreenAction = /** @class */ (function () {
    function TouchScreenAction(kind, payload) {
        this.kind = kind;
        this.payload = payload;
    }
    return TouchScreenAction;
}());
var TouchStartPayload = /** @class */ (function () {
    function TouchStartPayload(changedTouches) {
        this.changedTouches = changedTouches;
    }
    return TouchStartPayload;
}());
var TouchMovePayload = /** @class */ (function () {
    function TouchMovePayload(changedTouches) {
        this.changedTouches = changedTouches;
    }
    return TouchMovePayload;
}());
var TouchEndPayload = /** @class */ (function () {
    function TouchEndPayload(changedTouches) {
        this.changedTouches = changedTouches;
    }
    return TouchEndPayload;
}());
function findTouch(id, touchList) {
    for (var i = 0; i < touchList.length; i++) {
        if (touchList[i].identifier == id) {
            return touchList[i];
        }
    }
    return undefined;
}
var TouchScreenStateMachine = /** @class */ (function () {
    function TouchScreenStateMachine() {
        var _this = this;
        this.state = new Home();
        this.touchLocHistoryScr = new Map();
        canvas.addEventListener("touchstart", function (ev) {
            var payload = new TouchStartPayload(ev.changedTouches);
            _this.state.update(_this, new TouchScreenAction(TSActionKind.TouchStart, payload));
            var boundingRect = canvas.getBoundingClientRect();
            for (var i = 0; i < ev.changedTouches.length; i++) {
                var touch = ev.changedTouches[i];
                _this.touchLocHistoryScr.set(touch.identifier, new Vec2(touch.clientX - boundingRect.x, touch.clientY - boundingRect.y));
            }
            ev.preventDefault();
        });
        canvas.addEventListener("touchmove", function (ev) {
            var payload = new TouchMovePayload(ev.changedTouches);
            _this.state.update(_this, new TouchScreenAction(TSActionKind.TouchMove, payload));
            var boundingRect = canvas.getBoundingClientRect();
            for (var i = 0; i < ev.changedTouches.length; i++) {
                var touch = ev.changedTouches[i];
                _this.touchLocHistoryScr.set(touch.identifier, new Vec2(touch.clientX - boundingRect.x, touch.clientY - boundingRect.y));
            }
            ev.preventDefault();
        });
        canvas.addEventListener("touchend", function (ev) {
            var payload = new TouchEndPayload(ev.changedTouches);
            _this.state.update(_this, new TouchScreenAction(TSActionKind.TouchEnd, payload));
            for (var i = 0; i < ev.changedTouches.length; i++) {
                _this.touchLocHistoryScr.delete(ev.changedTouches[i].identifier);
            }
            ev.preventDefault();
        });
    }
    return TouchScreenStateMachine;
}());
export { TouchScreenStateMachine };
var Home = /** @class */ (function () {
    function Home() {
    }
    Home.prototype.update = function (manager, action) {
        var boundingRect = canvas.getBoundingClientRect();
        if (action.kind === TSActionKind.TouchStart) {
            var payload = action.payload;
            if (payload.changedTouches.length === 1) {
                var touch = payload.changedTouches[0];
                var locScr = new Vec2(touch.clientX - boundingRect.x, touch.clientY - boundingRect.y);
                var focusObject = sceneManager.getObjectAt(locScr);
                if (focusObject == null) {
                    manager.state = new Panning(touch.identifier);
                }
            }
        }
    };
    return Home;
}());
var Panning = /** @class */ (function () {
    function Panning(touchId) {
        this.touchId = touchId;
    }
    Panning.prototype.update = function (manager, action) {
        var boundingRect = canvas.getBoundingClientRect();
        if (action.kind === TSActionKind.TouchMove) {
            var payload = action.payload;
            if (payload.changedTouches.length !== 1) {
                domLog("[TSPanning(Err)][TouchMove] payload.changedTouches.length: ".concat(payload.changedTouches.length));
                throw Error();
            }
            var touch = payload.changedTouches[0];
            var locScr = new Vec2(touch.clientX - boundingRect.x, touch.clientY - boundingRect.y);
            var previousLocScr = manager.touchLocHistoryScr.get(this.touchId);
            if (previousLocScr == null) {
                domLog("[TSPanning(Err)][TouchMove] No history for touch location");
                throw Error();
            }
            viewManager.pan(locScr.sub(previousLocScr));
            return;
        }
        if (action.kind === TSActionKind.TouchEnd) {
            var payload = action.payload;
            if (payload.changedTouches.length !== 1) {
                domLog("[TSPanning(Err)][TouchEnd] payload.changedTouches.length: ".concat(payload.changedTouches.length));
                throw Error();
            }
            manager.state = new Home();
            return;
        }
    };
    return Panning;
}());
