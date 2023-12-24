import { assert, circuits, domLog } from "./main.js";
import { Rect, Vec2, clamp, pointRectIntersection } from "./math.js";
export var canvas;
export var ctx;
export var zoomScale = 1;
var MAX_ZOOM = Infinity;
var MIN_ZOOM = 0.2;
export var panOffset = new Vec2(0, 0);
var isPanning = false;
var isDragging = false;
var isZooming = false;
var circuitBeingDragged = undefined;
var dragOffset;
var touches = new Array();
var previousLocationOfTouches = new Map();
var panningDom = document.getElementById("panning");
var draggingDom = document.getElementById("dragging");
var zoomingDom = document.getElementById("zooming");
function setPanning(value) {
    if (panningDom != null) {
        panningDom.checked = value;
    }
    if (!isPanning && value) {
        domLog("Panning");
    }
    isPanning = value;
}
function setDragging(value) {
    if (draggingDom != null) {
        draggingDom.checked = value;
    }
    if (!isDragging && value) {
        domLog("Dragging");
    }
    isDragging = value;
}
function setZooming(value) {
    if (zoomingDom != null) {
        zoomingDom.checked = value;
    }
    if (!isZooming && value) {
        domLog("Zooming");
    }
    isZooming = value;
}
export function worldToScreen(coord) {
    return new Vec2(coord.x * zoomScale + panOffset.x, coord.y * zoomScale + panOffset.y);
}
export function screenToWorld(coord) {
    return new Vec2((coord.x - panOffset.x) / zoomScale, (coord.y - panOffset.y) / zoomScale);
}
function getCircuitUnderMouse(mouse) {
    for (var i = 0; i < circuits.length; i++) {
        var circuitRect = circuits[i].screenRect();
        if (pointRectIntersection(mouse, circuitRect)) {
            dragOffset = new Vec2(circuitRect.x - mouse.x, circuitRect.y - mouse.y);
            return circuits[i];
        }
    }
    return undefined;
}
var MouseButton;
(function (MouseButton) {
    MouseButton[MouseButton["Primary"] = 0] = "Primary";
    MouseButton[MouseButton["Auxiliary"] = 1] = "Auxiliary";
    MouseButton[MouseButton["Secondary"] = 2] = "Secondary";
})(MouseButton || (MouseButton = {}));
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
    assert(canvas_ != null, "The dom does not contain a canvas");
    canvas = canvas_;
    var ctx_ = canvas.getContext("2d");
    assert(ctx_ != null, "Could not get 2d context from canvas");
    ctx = ctx_;
    // -----------------------------------------------------------
    canvas.addEventListener("mousedown", function (ev) {
        setZooming(false);
        if (ev.button != MouseButton.Primary) {
            return;
        }
        var offset = new Vec2(ev.offsetX, ev.offsetY);
        circuitBeingDragged = getCircuitUnderMouse(offset);
        if (circuitBeingDragged == null) {
            setPanning(true);
            return;
        }
        setDragging(true);
    });
    canvas.addEventListener("touchstart", function (ev) {
        if (isDragging || isZooming) {
            ev.preventDefault();
            return;
        }
        var boundingBox = canvas.getBoundingClientRect();
        for (var i = 0; i < ev.changedTouches.length && touches.length < 2; i++) {
            var touch = ev.changedTouches[i];
            touches.push(touch.identifier);
            var offset = new Vec2(touch.clientX - boundingBox.x, touch.clientY - boundingBox.y);
            previousLocationOfTouches.set(touch.identifier, offset);
        }
        if (touches.length === 2) {
            setPanning(false);
            setZooming(true);
        }
        ev.preventDefault();
    });
    // -----------------------------------------------------------
    canvas.addEventListener("mousemove", function (ev) {
        var mouse = new Vec2(ev.offsetX, ev.offsetY);
        if (isPanning) {
            panOffset = panOffset.add(new Vec2(ev.movementX, ev.movementY));
            return;
        }
        if (isDragging) {
            if (circuitBeingDragged == null) {
                domLog("[mousemove] isDragging && circuitBeingDragged == null");
                throw Error();
            }
            circuitBeingDragged.pos = screenToWorld(new Vec2(ev.offsetX, ev.offsetY).add(dragOffset));
            return;
        }
        var selected = getCircuitUnderMouse(mouse);
        for (var i = 0; i < circuits.length; i++) {
            circuits[i].isBeingHovered = false;
        }
        if (selected != null) {
            selected.isBeingHovered = true;
        }
    });
    canvas.addEventListener("touchmove", function (ev) {
        assert(touches.length > 0 && touches.length <= 2, "[touchmove] touches.length = ".concat(touches.length));
        var boundingBox = canvas.getBoundingClientRect();
        if (!(isPanning || isZooming || isDragging)) {
            if (touches.length === 2) {
                setZooming(true);
            }
            else {
                var touch = getRelevantTouch(ev, touches[0]);
                if (touch == null) {
                    return;
                }
                var touchLocation = new Vec2(touch.clientX - boundingBox.x, touch.clientY - boundingBox.y);
                var circuit = getCircuitUnderMouse(touchLocation);
                if (circuit == null) {
                    setPanning(true);
                }
                else {
                    setDragging(true);
                    circuitBeingDragged = circuit;
                }
            }
        }
        if (isPanning) {
            var touch = getRelevantTouch(ev, touches[0]);
            if (touch == null) {
                return;
            }
            var touchLocation = new Vec2(touch.clientX - boundingBox.x, touch.clientY - boundingBox.y);
            var previousLocation = previousLocationOfTouches.get(touch.identifier);
            if (previousLocation == null) {
                domLog("[touchmove] Touch id(".concat(touch.identifier, ") was registered but its previous location was not."));
                throw Error("[touchmove] Touch id(".concat(touch.identifier, ") was registered but its previous location was not."));
            }
            previousLocationOfTouches.set(touch.identifier, touchLocation);
            panOffset = panOffset.add(touchLocation.sub(previousLocation));
        }
        else if (isDragging) {
            if (circuitBeingDragged == null) {
                domLog("[touchmove] Dragging, but circuitBeingDragged == null");
                throw Error();
            }
            var touch = getRelevantTouch(ev, touches[0]);
            if (touch == null) {
                return;
            }
            var offset = new Vec2(touch.clientX - boundingBox.x, touch.clientY - boundingBox.y);
            circuitBeingDragged.pos = screenToWorld(offset.add(dragOffset));
        }
        else if (isZooming) {
            var touch0 = getRelevantTouch(ev, touches[0]);
            var touch1 = getRelevantTouch(ev, touches[1]);
            if (touch0 == null && touch1 == null) {
                return;
            }
            var tmp0 = previousLocationOfTouches.get(touches[0]);
            var tmp1 = previousLocationOfTouches.get(touches[1]);
            if (tmp0 == null || tmp1 == null) {
                domLog("[touchmove] tmp0 == null || tmp1 == null");
                throw Error();
            }
            var touch0PreviousLoc = tmp0;
            var touch1PreviousLoc = tmp1;
            var zoomRectPrevious = Rect.fromEndPoints(touch0PreviousLoc, touch1PreviousLoc)
                .forceAspectRatio(1)
                .withMidPoint(touch0PreviousLoc.lerp(touch1PreviousLoc, 1 / 2));
            var touch0ScreenPos = touch0 != null
                ? new Vec2(touch0.clientX - boundingBox.x, touch0.clientY - boundingBox.y)
                : touch0PreviousLoc;
            var touch1ScreenPos = touch1 != null
                ? new Vec2(touch1.clientX - boundingBox.x, touch1.clientY - boundingBox.y)
                : touch1PreviousLoc;
            previousLocationOfTouches.set(touches[0], touch0ScreenPos);
            previousLocationOfTouches.set(touches[1], touch1ScreenPos);
            var zoomRectCurrent = Rect.fromEndPoints(touch0ScreenPos, touch1ScreenPos)
                .forceAspectRatio(1)
                .withMidPoint(touch0ScreenPos.lerp(touch1ScreenPos, 1 / 2));
            var zoomOrigin = zoomRectCurrent.midPoint();
            var zoomOriginInWorld = screenToWorld(zoomOrigin);
            zoomScale *= zoomRectCurrent.width / zoomRectPrevious.width;
            zoomScale = clamp(zoomScale, MIN_ZOOM, MAX_ZOOM);
            panOffset = zoomOrigin.sub(zoomOriginInWorld.scalarMul(zoomScale));
            panOffset = panOffset.add(zoomRectCurrent.midPoint().sub(zoomRectPrevious.midPoint()));
        }
        ev.preventDefault();
    });
    // -----------------------------------------------------------
    canvas.addEventListener("mouseup", function (ev) {
        if (ev.button != MouseButton.Primary) {
            return;
        }
        if (isPanning) {
            setPanning(false);
            return;
        }
        if (isDragging) {
            if (circuitBeingDragged == null) {
                throw Error();
            }
            circuitBeingDragged.isBeingHovered = false;
            circuitBeingDragged = undefined;
            setDragging(false);
        }
    });
    var touchend = function (ev) {
        assert(touches.length > 0 && touches.length <= 2, "[touchend] touches.length = ".concat(touches.length));
        if (isPanning || isDragging) {
            var touch = getRelevantTouch(ev, touches[0]);
            if (touch == null) {
                return;
            }
            assert(touches.length === 1, "[touchend] ".concat(isPanning ? "Panning" : "Dragging", ", but touches.length = ").concat(touches.length));
            if (isPanning) {
                setPanning(false);
            }
            else {
                if (circuitBeingDragged == null) {
                    throw Error("Dragging, but circuitBeingDragged == null");
                }
                setDragging(false);
                circuitBeingDragged.isBeingHovered = false;
                circuitBeingDragged = undefined;
            }
            previousLocationOfTouches.delete(touch.identifier);
            touches = new Array();
        }
        if (isZooming) {
            assert(touches.length === 2, "[touchend] Zooming, but touches.length = ".concat(touches.length));
            setZooming(false);
            var touch0 = getRelevantTouch(ev, touches[0]);
            var touch1 = getRelevantTouch(ev, touches[1]);
            if (touch0 == null && touch1 == null) {
                return;
            }
            if (touch1 != null) {
                previousLocationOfTouches.delete(touch1.identifier);
                touches.pop();
            }
            if (touch0 != null) {
                previousLocationOfTouches.delete(touch0.identifier);
                touches.shift();
            }
            if (touches.length === 1) {
                setPanning(true);
            }
        }
        ev.preventDefault();
    };
    canvas.addEventListener("touchend", touchend);
    canvas.addEventListener("touchcancel", touchend);
    // -----------------------------------------------------------
    canvas.addEventListener("wheel", function (ev) {
        setZooming(true);
        var worldMouse = screenToWorld(new Vec2(ev.offsetX, ev.offsetY));
        zoomScale -= ev.deltaY * 0.001;
        zoomScale = clamp(zoomScale, MIN_ZOOM, MAX_ZOOM);
        panOffset = new Vec2(ev.offsetX - worldMouse.x * zoomScale, ev.offsetY - worldMouse.y * zoomScale);
        ev.preventDefault();
    });
}
