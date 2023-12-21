import { Circuit } from "./circuit.js";
import { circuits } from "./main.js";
import { Point, clamp, pointRectIntersection } from "./math.js";

export let canvas: HTMLCanvasElement;
export let ctx: CanvasRenderingContext2D;
export let zoomScale = 1;
export let panOffset = new Point(0, 0);

export let isPanning = false;

export function worldToScreen(coord: Point) {
  return new Point(
    coord.x * zoomScale + panOffset.x,
    coord.y * zoomScale + panOffset.y
  );
}

export function screenToWorld(coord: Point) {
  return new Point(
    (coord.x - panOffset.x) / zoomScale,
    (coord.y - panOffset.y) / zoomScale
  );
}

const loggingDom = document.getElementById("logging");
if (loggingDom == null) {
  console.info("No logging dom!");
}

let circuitBeingDragged: Circuit | undefined = undefined;
let dragOffset: Point;
let touchIdentifier: number | undefined = undefined;

function getCircuitUnderMouse(mouse: Point) {
  for (let i = 0; i < circuits.length; i++) {
    const circuitRect = circuits[i].screenRect();
    if (pointRectIntersection(mouse, circuitRect)) {
      dragOffset = new Point(circuitRect.x - mouse.x, circuitRect.y - mouse.y);
      circuits[i].isBeingHovered = true;
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

export function init() {
  let canvas_ = document.getElementById("main-canvas");
  if (canvas_ == null) {
    throw Error("The dom does not contain a canvas");
  }
  canvas = canvas_ as HTMLCanvasElement;
  let ctx_ = canvas.getContext("2d");
  if (ctx_ == null) {
    throw Error("Could not get 2d context from canvas");
  }
  ctx = ctx_ as CanvasRenderingContext2D;

  // -----------------------------------------------------------
  canvas.addEventListener("mousedown", (ev) => {
    if (ev.button != MouseButton.Primary) {
      console.debug("Event button is other than primary");
      console.debug("Event button: ", ev.button);
      return;
    }

    let offset = new Point(ev.offsetX, ev.offsetY);
    circuitBeingDragged = getCircuitUnderMouse(offset);
    if (circuitBeingDragged == null) {
      isPanning = true;
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

  canvas.addEventListener("touchstart", (ev) => {
    if (touchIdentifier != null) {
      return;
    }
    const boundingBox = canvas.getBoundingClientRect();
    const touch = ev.changedTouches[0];
    const offset = new Point(
      touch.clientX - boundingBox.x,
      touch.clientY - boundingBox.y
    );
    circuitBeingDragged = getCircuitUnderMouse(offset);
    if (circuitBeingDragged == null) {
      return;
    }

    if (loggingDom != null) {
      loggingDom.innerHTML = "touching";
    }
    ev.preventDefault();
    touchIdentifier = touch.identifier;
  });
  // -----------------------------------------------------------

  canvas.addEventListener("mousemove", (ev) => {
    let mouse = new Point(ev.offsetX, ev.offsetY);
    if (isPanning) {
      panOffset = panOffset.add(new Point(ev.movementX, ev.movementY));
      new Point(panOffset.x + ev.movementX, panOffset.y + ev.movementY);
      return;
    }
    if (circuitBeingDragged == null) {
      const selected = getCircuitUnderMouse(mouse);
      for (let i = 0; i < circuits.length; i++) {
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
    circuitBeingDragged.pos = screenToWorld(
      new Point(ev.offsetX, ev.offsetY).add(dragOffset)
    );
  });
  canvas.addEventListener("touchmove", (ev) => {
    if (touchIdentifier == null || circuitBeingDragged == null) {
      return;
    }

    const touch = getRelevantTouch(ev, touchIdentifier);
    if (touch == null) {
      return;
    }

    if (loggingDom != null) {
      loggingDom.innerHTML = "touching<br>moving";
    }
    ev.preventDefault();

    const boundingBox = canvas.getBoundingClientRect();
    const offset = new Point(
      touch.clientX - boundingBox.x,
      touch.clientY - boundingBox.y
    );

    circuitBeingDragged.pos = screenToWorld(offset.add(dragOffset));
  });
  // -----------------------------------------------------------

  canvas.addEventListener("mouseup", (ev) => {
    if (ev.button != MouseButton.Primary) {
      return;
    }
    if (circuitBeingDragged != null && isPanning) {
      throw Error("Dragging circuit and Panning at the same time");
    }

    if (isPanning) {
      isPanning = false;
      return;
    }
    if (circuitBeingDragged != null) {
      circuitBeingDragged.isBeingHovered = false;
      circuitBeingDragged = undefined;
    }
    if (loggingDom != null) {
      loggingDom.innerHTML = "";
    }
  });
  const touchend = (ev: TouchEvent) => {
    if (touchIdentifier == null || circuitBeingDragged == null) {
      return;
    }
    if (getRelevantTouch(ev, touchIdentifier) == null) {
      return;
    }

    if (loggingDom != null) {
      loggingDom.innerHTML = "";
    }

    ev.preventDefault();
    circuitBeingDragged.isBeingHovered = false;
    circuitBeingDragged = undefined;
    touchIdentifier = undefined;
  };
  canvas.addEventListener("touchend", touchend);
  canvas.addEventListener("touchcancel", touchend);
  // -----------------------------------------------------------

  canvas.addEventListener("wheel", function (ev) {
    let worldMouse = screenToWorld(new Point(ev.offsetX, ev.offsetY));
    zoomScale -= ev.deltaY * 0.001;
    zoomScale = clamp(zoomScale, 0.2, Infinity);
    panOffset = new Point(
      ev.offsetX - worldMouse.x * zoomScale,
      ev.offsetY - worldMouse.y * zoomScale
    );
    console.log("panOffset: ", panOffset);
    ev.preventDefault();
    console.log("Zoom Amount: ", zoomScale);
  });
}
