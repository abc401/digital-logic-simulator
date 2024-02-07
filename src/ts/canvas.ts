import { Circuit } from "./circuit.js";
import { assert, circuits, domLog } from "./main.js";
import { Rect, Vec2, clamp } from "./math.js";

export let canvas: HTMLCanvasElement;
export let ctx: CanvasRenderingContext2D;
export let zoomLevel = 1;
const MAX_ZOOM = Infinity;
const MIN_ZOOM = 0.2;
export let panOffset = new Vec2(0, 0);

let isPanning = false;
let isDragging = false;
let isZooming = false;

let circuitBeingDragged: Circuit | undefined = undefined;
let dragOffset: Vec2;

type TouchIdentifier = number;
let touches = new Array<TouchIdentifier>();
let previousLocationOfTouches = new Map<TouchIdentifier, Vec2>();

const panningDom = document.getElementById("panning");
const draggingDom = document.getElementById("dragging");
const zoomingDom = document.getElementById("zooming");

function setPanning(value: boolean) {
  if (panningDom != null) {
    (panningDom as HTMLInputElement).checked = value;
  }
  if (!isPanning && value) {
    domLog("Panning");
  }
  isPanning = value;
}
function setDragging(value: boolean) {
  if (draggingDom != null) {
    (draggingDom as HTMLInputElement).checked = value;
  }
  if (!isDragging && value) {
    domLog("Dragging");
  }
  isDragging = value;
}
function setZooming(value: boolean) {
  if (zoomingDom != null) {
    (zoomingDom as HTMLInputElement).checked = value;
  }
  if (!isZooming && value) {
    domLog("Zooming");
  }
  isZooming = value;
}

export function worldToScreen(coord: Vec2) {
  return new Vec2(
    coord.x * zoomLevel + panOffset.x,
    coord.y * zoomLevel + panOffset.y
  );
}

export function screenToWorld(coord: Vec2) {
  return new Vec2(
    (coord.x - panOffset.x) / zoomLevel,
    (coord.y - panOffset.y) / zoomLevel
  );
}

function getCircuitUnderMouse(mouse: Vec2) {
  for (let i = 0; i < circuits.length; i++) {
    const circuitRect = circuits[i].screenRect();
    if (circuitRect.pointIntersection(mouse)) {
      dragOffset = new Vec2(circuitRect.x - mouse.x, circuitRect.y - mouse.y);
      return circuits[i];
    }
  }
  return undefined;
}

enum MouseButton {
  Primary = 0,
  Auxiliary = 1,
  Secondary = 2,
}

function getRelevantTouch(ev: TouchEvent, relevantIdentifier: number) {
  for (let i = 0; i < ev.changedTouches.length; i++) {
    if (ev.changedTouches[i].identifier == relevantIdentifier) {
      return ev.changedTouches[i];
    }
  }
  return undefined;
}

export function createCanvas() {
  let canvas_ = document.getElementById("main-canvas");
  assert(canvas_ != null, "The dom does not contain a canvas");
  canvas = canvas_ as HTMLCanvasElement;

  let ctx_ = canvas.getContext("2d");
  assert(ctx_ != null, "Could not get 2d context from canvas");
  ctx = ctx_ as CanvasRenderingContext2D;
}

export function init() {
  createCanvas();

  // -----------------------------------------------------------
  canvas.addEventListener("mousedown", (ev) => {
    setZooming(false);
    if (ev.button != MouseButton.Primary) {
      return;
    }

    let offset = new Vec2(ev.offsetX, ev.offsetY);
    circuitBeingDragged = getCircuitUnderMouse(offset);
    if (circuitBeingDragged == null) {
      setPanning(true);
      return;
    }
    setDragging(true);
  });

  canvas.addEventListener("touchstart", (ev) => {
    if (isDragging || isZooming) {
      ev.preventDefault();
      return;
    }
    const boundingBox = canvas.getBoundingClientRect();
    for (let i = 0; i < ev.changedTouches.length && touches.length < 2; i++) {
      const touch = ev.changedTouches[i];
      touches.push(touch.identifier);

      const offset = new Vec2(
        touch.clientX - boundingBox.x,
        touch.clientY - boundingBox.y
      );
      previousLocationOfTouches.set(touch.identifier, offset);
    }
    if (touches.length === 2) {
      setPanning(false);
      setZooming(true);
    }
    ev.preventDefault();
  });
  // -----------------------------------------------------------

  canvas.addEventListener("mousemove", (ev) => {
    let mouse = new Vec2(ev.offsetX, ev.offsetY);
    if (isPanning) {
      panOffset = panOffset.add(new Vec2(ev.movementX, ev.movementY));
      return;
    }
    if (isDragging) {
      if (circuitBeingDragged == null) {
        domLog("[mousemove] isDragging && circuitBeingDragged == null");
        throw Error();
      }
      circuitBeingDragged.rectW.xy = screenToWorld(
        new Vec2(ev.offsetX, ev.offsetY).add(dragOffset)
      );
      return;
    }

    const selected = getCircuitUnderMouse(mouse);
    for (let i = 0; i < circuits.length; i++) {
      circuits[i].isBeingHovered = false;
    }
    if (selected != null) {
      selected.isBeingHovered = true;
    }
  });
  canvas.addEventListener("touchmove", (ev) => {
    assert(
      touches.length > 0 && touches.length <= 2,
      `[touchmove] touches.length = ${touches.length}`
    );

    const boundingBox = canvas.getBoundingClientRect();

    if (!(isPanning || isZooming || isDragging)) {
      if (touches.length === 2) {
        setZooming(true);
      } else {
        const touch = getRelevantTouch(ev, touches[0]);
        if (touch == null) {
          return;
        }

        const touchLocation = new Vec2(
          touch.clientX - boundingBox.x,
          touch.clientY - boundingBox.y
        );
        const circuit = getCircuitUnderMouse(touchLocation);
        if (circuit == null) {
          setPanning(true);
        } else {
          setDragging(true);
          circuitBeingDragged = circuit;
        }
      }
    }

    if (isPanning) {
      let touch = getRelevantTouch(ev, touches[0]);
      if (touch == null) {
        return;
      }
      const touchLocation = new Vec2(
        touch.clientX - boundingBox.x,
        touch.clientY - boundingBox.y
      );
      const previousLocation = previousLocationOfTouches.get(touch.identifier);
      if (previousLocation == null) {
        domLog(
          `[touchmove] Touch id(${touch.identifier}) was registered but its previous location was not.`
        );
        throw Error(
          `[touchmove] Touch id(${touch.identifier}) was registered but its previous location was not.`
        );
      }
      previousLocationOfTouches.set(touch.identifier, touchLocation);
      panOffset = panOffset.add(touchLocation.sub(previousLocation));
    } else if (isDragging) {
      if (circuitBeingDragged == null) {
        domLog("[touchmove] Dragging, but circuitBeingDragged == null");
        throw Error();
      }
      let touch = getRelevantTouch(ev, touches[0]);
      if (touch == null) {
        return;
      }
      const offset = new Vec2(
        touch.clientX - boundingBox.x,
        touch.clientY - boundingBox.y
      );
      circuitBeingDragged.rectW.xy = screenToWorld(offset.add(dragOffset));
    } else if (isZooming) {
      let touch0 = getRelevantTouch(ev, touches[0]);
      let touch1 = getRelevantTouch(ev, touches[1]);

      if (touch0 == null && touch1 == null) {
        return;
      }

      let tmp0 = previousLocationOfTouches.get(touches[0]);
      let tmp1 = previousLocationOfTouches.get(touches[1]);

      if (tmp0 == null || tmp1 == null) {
        domLog("[touchmove] tmp0 == null || tmp1 == null");
        throw Error();
      }

      let touch0PreviousLoc = tmp0;
      let touch1PreviousLoc = tmp1;

      const zoomRectPrevious = Rect.fromEndPoints(
        touch0PreviousLoc,
        touch1PreviousLoc
      )
        .forceAspectRatio(1)
        .withMidPoint(touch0PreviousLoc.lerp(touch1PreviousLoc, 1 / 2));

      let touch0ScreenPos =
        touch0 != null
          ? new Vec2(
              touch0.clientX - boundingBox.x,
              touch0.clientY - boundingBox.y
            )
          : touch0PreviousLoc;
      let touch1ScreenPos =
        touch1 != null
          ? new Vec2(
              touch1.clientX - boundingBox.x,
              touch1.clientY - boundingBox.y
            )
          : touch1PreviousLoc;

      previousLocationOfTouches.set(touches[0], touch0ScreenPos);
      previousLocationOfTouches.set(touches[1], touch1ScreenPos);

      const zoomRectCurrent = Rect.fromEndPoints(
        touch0ScreenPos,
        touch1ScreenPos
      )
        .forceAspectRatio(1)
        .withMidPoint(touch0ScreenPos.lerp(touch1ScreenPos, 1 / 2));

      const zoomOrigin = zoomRectCurrent.midPoint();
      const zoomOriginInWorld = screenToWorld(zoomOrigin);

      zoomLevel *= zoomRectCurrent.w / zoomRectPrevious.w;
      zoomLevel = clamp(zoomLevel, MIN_ZOOM, MAX_ZOOM);

      panOffset = zoomOrigin.sub(zoomOriginInWorld.scalarMul(zoomLevel));
      panOffset = panOffset.add(
        zoomRectCurrent.midPoint().sub(zoomRectPrevious.midPoint())
      );
    }

    ev.preventDefault();
  });
  // -----------------------------------------------------------

  canvas.addEventListener("mouseup", (ev) => {
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
  const touchend = (ev: TouchEvent) => {
    assert(
      touches.length > 0 && touches.length <= 2,
      `[touchend] touches.length = ${touches.length}`
    );

    if (isPanning || isDragging) {
      const touch = getRelevantTouch(ev, touches[0]);
      if (touch == null) {
        return;
      }

      assert(
        touches.length === 1,
        `[touchend] ${
          isPanning ? "Panning" : "Dragging"
        }, but touches.length = ${touches.length}`
      );
      if (isPanning) {
        setPanning(false);
      } else {
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
      assert(
        touches.length === 2,
        `[touchend] Zooming, but touches.length = ${touches.length}`
      );
      setZooming(false);
      const touch0 = getRelevantTouch(ev, touches[0]);
      const touch1 = getRelevantTouch(ev, touches[1]);

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
    let worldMouse = screenToWorld(new Vec2(ev.offsetX, ev.offsetY));
    zoomLevel -= ev.deltaY * 0.001;
    zoomLevel = clamp(zoomLevel, MIN_ZOOM, MAX_ZOOM);
    panOffset = new Vec2(
      ev.offsetX - worldMouse.x * zoomLevel,
      ev.offsetY - worldMouse.y * zoomLevel
    );
    ev.preventDefault();
  });
}
