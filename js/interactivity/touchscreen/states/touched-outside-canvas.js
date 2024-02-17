var TouchedOutsideCanvas = /** @class */ (function () {
    function TouchedOutsideCanvas(touchesOutsideCanvas) {
        this.touchesOutsideCanvas = touchesOutsideCanvas;
        this.stateName = "TouchedOutsideCanvas";
    }
    TouchedOutsideCanvas.prototype.touchEnd = function (stateMachine, payload) {
        for (var i = 0; i < payload.changedTouches.length; i++) {
            var touch = payload.changedTouches[i];
            var idx = this.touchesOutsideCanvas.indexOf(touch.identifier);
            if (idx === -1) {
                continue;
            }
            this.touchesOutsideCanvas.splice(idx, 1);
        }
    };
    TouchedOutsideCanvas.prototype.touchMove = function (stateMachine, payload) { };
    TouchedOutsideCanvas.prototype.touchStart = function (stateMachine, payload) { };
    return TouchedOutsideCanvas;
}());
export { TouchedOutsideCanvas };
