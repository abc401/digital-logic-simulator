import { circuits } from "./main.js";
import { Point, pointRectIntersection } from "./math.js";
export var canvas;
export var ctx;
var loggingDom = document.getElementById("logging");
if (loggingDom == null) {
    console.info("No logging dom!");
}
var selectedCircuit = undefined;
var mouseOffsetWrtRect;
var touchIdentifier = undefined;
function getCircuitUnderMouse(mouse) {
    for (var i = 0; i < circuits.length; i++) {
        var circuitRect = circuits[i].rect();
        if (pointRectIntersection(mouse, circuitRect)) {
            mouseOffsetWrtRect = new Point(circuitRect.x - mouse.x, circuitRect.y - mouse.y);
            circuits[i].isBeingHovered = true;
            return circuits[i];
        }
    }
    return undefined;
}
function getRelevantTouch(ev, relevantIdentifier) {
    for (var i = 0; i < ev.changedTouches.length; i++) {
        if (ev.changedTouches[i].identifier == relevantIdentifier) {
            return ev.changedTouches[i];
        }
    }
    return undefined;
}
export function init() {
    var canvas_ = document.getElementById("main-canvas");
    if (canvas_ == null) {
        throw Error("The dom does not contain a canvas");
    }
    canvas = canvas_;
    var ctx_ = canvas.getContext("2d");
    if (ctx_ == null) {
        throw Error("Could not get 2d context from canvas");
    }
    ctx = ctx_;
    // -----------------------------------------------------------
    canvas.addEventListener("mousedown", function (ev) {
        var offset = new Point(ev.offsetX, ev.offsetY);
        selectedCircuit = getCircuitUnderMouse(offset);
        if (selectedCircuit == null) {
            console.log("Selected circuit = null");
            return;
        }
        if (loggingDom != null) {
            console.log("inner html: ", loggingDom.innerHTML);
            console.log("clicked");
            loggingDom.innerHTML = "<p>clicked</p>";
            console.log("Inner html: ", loggingDom.innerHTML);
            console.log("loggingDom: ", loggingDom);
            return;
        }
        console.log("logging dom was empty.");
    });
    canvas.addEventListener("touchstart", function (ev) {
        if (touchIdentifier != null) {
            return;
        }
        var boundingBox = canvas.getBoundingClientRect();
        var touch = ev.changedTouches[0];
        var offset = new Point(touch.clientX - boundingBox.x, touch.clientY - boundingBox.y);
        selectedCircuit = getCircuitUnderMouse(offset);
        if (selectedCircuit == null) {
            return;
        }
        if (loggingDom != null) {
            loggingDom.innerHTML = "touching";
        }
        ev.preventDefault();
        touchIdentifier = touch.identifier;
    });
    // -----------------------------------------------------------
    canvas.addEventListener("mousemove", function (ev) {
        if (selectedCircuit == null) {
            var mouse = new Point(ev.offsetX, ev.offsetY);
            var selected = getCircuitUnderMouse(mouse);
            for (var i = 0; i < circuits.length; i++) {
                circuits[i].isBeingHovered = false;
            }
            if (selected != null) {
                selected.isBeingHovered = true;
            }
            return;
        }
        if (loggingDom != null) {
            loggingDom.innerHTML = "clicked<br>moving";
        }
        selectedCircuit.pos_x = ev.offsetX + mouseOffsetWrtRect.x;
        selectedCircuit.pos_y = ev.offsetY + mouseOffsetWrtRect.y;
    });
    canvas.addEventListener("touchmove", function (ev) {
        if (touchIdentifier == null || selectedCircuit == null) {
            return;
        }
        var touch = getRelevantTouch(ev, touchIdentifier);
        if (touch == null) {
            return;
        }
        if (loggingDom != null) {
            loggingDom.innerHTML = "touching<br>moving";
        }
        ev.preventDefault();
        var boundingBox = canvas.getBoundingClientRect();
        var offset = new Point(touch.clientX - boundingBox.x, touch.clientY - boundingBox.y);
        selectedCircuit.pos_x = offset.x + mouseOffsetWrtRect.x;
        selectedCircuit.pos_y = offset.y + mouseOffsetWrtRect.y;
    });
    // -----------------------------------------------------------
    canvas.addEventListener("mouseup", function (ev) {
        if (selectedCircuit == null) {
            return;
        }
        if (loggingDom != null) {
            loggingDom.innerHTML = "";
        }
        selectedCircuit.isBeingHovered = false;
        selectedCircuit = undefined;
    });
    var touchend = function (ev) {
        if (touchIdentifier == null || selectedCircuit == null) {
            return;
        }
        if (getRelevantTouch(ev, touchIdentifier) == null) {
            return;
        }
        if (loggingDom != null) {
            loggingDom.innerHTML = "";
        }
        ev.preventDefault();
        selectedCircuit.isBeingHovered = false;
        selectedCircuit = undefined;
        touchIdentifier = undefined;
    };
    canvas.addEventListener("touchend", touchend);
    canvas.addEventListener("touchcancel", touchend);
    // -----------------------------------------------------------
}
