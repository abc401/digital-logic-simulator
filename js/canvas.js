import { circuits } from "./main.js";
import { Point, pointRectIntersection } from "./math.js";
export var canvas;
export var ctx;
var loggingDom = document.getElementById("logging");
var currentlyDragging = undefined;
var mouseOffsetWrtRect;
function getCurrentlySelectedCircuit(mouse) {
    for (var i = 0; i < circuits.length; i++) {
        var circuitRect = circuits[i].rect();
        if (pointRectIntersection(mouse, circuitRect)) {
            mouseOffsetWrtRect = new Point(circuitRect.x - mouse.x, circuitRect.y - mouse.y);
            circuits[i].selected = true;
            return circuits[i];
        }
    }
    return undefined;
}
function touchCanvasEvents(canvas) {
    var touchIdentifier = undefined;
    canvas.addEventListener("touchstart", function (ev) {
        if (touchIdentifier != null) {
            return;
        }
        var boundingBox = canvas.getBoundingClientRect();
        var touch = ev.touches[0];
        var offset = new Point(touch.clientX - boundingBox.x, touch.clientY - boundingBox.y);
        // console.debug(mouse);
        currentlyDragging = getCurrentlySelectedCircuit(offset);
        if (currentlyDragging == null) {
            return;
        }
        if (loggingDom != null) {
            loggingDom.innerHTML = "touching<br>";
        }
        ev.preventDefault();
        touchIdentifier = touch.identifier;
    });
    canvas.addEventListener("touchmove", function (ev) {
        if (touchIdentifier == null || currentlyDragging == null) {
            return;
        }
        var touch = undefined;
        for (var i = 0; i < ev.touches.length; i++) {
            touch = ev.touches[i];
            if (touch.identifier == touchIdentifier) {
                break;
            }
        }
        if (touch == null) {
            return;
        }
        if (loggingDom != null) {
            loggingDom.innerHTML = "touching<br>moving";
        }
        ev.preventDefault();
        var boundingBox = canvas.getBoundingClientRect();
        var offset = new Point(touch.clientX - boundingBox.x, touch.clientY - boundingBox.y);
        currentlyDragging.pos_x = offset.x + mouseOffsetWrtRect.x;
        currentlyDragging.pos_y = offset.y + mouseOffsetWrtRect.y;
    });
    var touchend = function (ev) {
        if (touchIdentifier == null) {
            return;
        }
        var touch = undefined;
        for (var i = 0; i < ev.changedTouches.length; i++) {
            touch = ev.changedTouches[i];
            if (touch.identifier == touchIdentifier) {
                break;
            }
        }
        if (touch == null) {
            return;
        }
        if (loggingDom != null) {
            loggingDom.innerHTML = "";
        }
        ev.preventDefault();
        if (currentlyDragging != null) {
            currentlyDragging.selected = false;
            currentlyDragging = undefined;
            touchIdentifier = undefined;
        }
    };
    canvas.addEventListener("touchend", touchend);
    canvas.addEventListener("touchcancel", touchend);
}
export function init() {
    var canvas_ = document.getElementById("main-canvas");
    if (canvas_ == null) {
        throw Error("The dom does not contain a canvas");
    }
    canvas = canvas_;
    canvas.addEventListener("mousedown", function (ev) {
        var offset = new Point(ev.offsetX, ev.offsetY);
        console.log(ev);
        // console.debug(mouse);
        currentlyDragging = getCurrentlySelectedCircuit(offset);
    });
    touchCanvasEvents(canvas);
    canvas.addEventListener("mousemove", function (ev) {
        console.log(ev);
        if (currentlyDragging == null) {
            var mouse = new Point(ev.offsetX, ev.offsetY);
            var selected = getCurrentlySelectedCircuit(mouse);
            for (var i = 0; i < circuits.length; i++) {
                circuits[i].selected = false;
            }
            if (selected != null) {
                selected.selected = true;
            }
            return;
        }
        currentlyDragging.pos_x = ev.offsetX + mouseOffsetWrtRect.x;
        currentlyDragging.pos_y = ev.offsetY + mouseOffsetWrtRect.y;
        // console.info("dragging");
    });
    canvas.addEventListener("mouseup", function (ev) {
        console.log(ev);
        if (currentlyDragging != null) {
            currentlyDragging.selected = false;
            currentlyDragging = undefined;
        }
        // console.info("dragging end");
    });
    var ctx_ = canvas.getContext("2d");
    if (ctx_ == null) {
        throw Error("Could not get 2d context from canvas");
    }
    ctx = ctx_;
}
