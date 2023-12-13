import { circuits } from "./main.js";
import { Point, pointRectIntersection } from "./math.js";
export var canvas;
export var ctx;
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
export function init() {
    var canvas_ = document.getElementById("main-canvas");
    if (canvas_ == null) {
        throw Error("The dom does not contain a canvas");
    }
    canvas = canvas_;
    canvas.addEventListener("mousedown", function (ev) {
        var mouse = new Point(ev.offsetX, ev.offsetY);
        console.debug(mouse);
        currentlyDragging = getCurrentlySelectedCircuit(mouse);
    });
    canvas.addEventListener("mousemove", function (ev) {
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
        console.info("dragging");
    });
    canvas.addEventListener("mouseup", function (ev) {
        if (currentlyDragging != null) {
            currentlyDragging.selected = false;
            currentlyDragging = undefined;
        }
        console.info("dragging end");
    });
    var ctx_ = canvas.getContext("2d");
    if (ctx_ == null) {
        throw Error("Could not get 2d context from canvas");
    }
    ctx = ctx_;
}
