import { Circuit } from "./circuit.js";
import { circuits } from "./main.js";
import { Point, pointRectIntersection } from "./math.js";

export let canvas: HTMLCanvasElement;
export let ctx: CanvasRenderingContext2D;

const loggingDom = document.getElementById("logging");

let currentlyDragging: Circuit | undefined = undefined;
let mouseOffsetWrtRect: Point;

function getCurrentlySelectedCircuit(mouse: Point) {
  for (let i = 0; i < circuits.length; i++) {
    const circuitRect = circuits[i].rect();
    if (pointRectIntersection(mouse, circuitRect)) {
      mouseOffsetWrtRect = new Point(
        circuitRect.x - mouse.x,
        circuitRect.y - mouse.y
      );
      circuits[i].selected = true;
      return circuits[i];
    }
  }
  return undefined;
}

function touchCanvasEvents(canvas: HTMLCanvasElement) {
  let touchIdentifier: number | undefined = undefined;
  canvas.addEventListener("touchstart", (ev) => {
    if (touchIdentifier != null) {
      return;
    }
    const boundingBox = canvas.getBoundingClientRect();
    const touch = ev.touches[0];
    const offset = new Point(
      touch.clientX - boundingBox.x,
      touch.clientY - boundingBox.y
    );
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

  canvas.addEventListener("touchmove", (ev) => {
    if (touchIdentifier == null || currentlyDragging == null) {
      return;
    }

    let touch: Touch | undefined = undefined;
    for (let i = 0; i < ev.touches.length; i++) {
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

    const boundingBox = canvas.getBoundingClientRect();
    const offset = new Point(
      touch.clientX - boundingBox.x,
      touch.clientY - boundingBox.y
    );

    currentlyDragging.pos_x = offset.x + mouseOffsetWrtRect.x;
    currentlyDragging.pos_y = offset.y + mouseOffsetWrtRect.y;
  });

  const touchend = (ev: TouchEvent) => {
    if (touchIdentifier == null) {
      return;
    }
    let touch: Touch | undefined = undefined;
    for (let i = 0; i < ev.changedTouches.length; i++) {
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
  let canvas_ = document.getElementById("main-canvas");
  if (canvas_ == null) {
    throw Error("The dom does not contain a canvas");
  }
  canvas = canvas_ as HTMLCanvasElement;
  canvas.addEventListener("mousedown", (ev) => {
    let offset = new Point(ev.offsetX, ev.offsetY);
    console.log(ev);
    // console.debug(mouse);
    currentlyDragging = getCurrentlySelectedCircuit(offset);
  });

  touchCanvasEvents(canvas);

  canvas.addEventListener("mousemove", (ev) => {
    console.log(ev);
    if (currentlyDragging == null) {
      let mouse = new Point(ev.offsetX, ev.offsetY);
      const selected = getCurrentlySelectedCircuit(mouse);
      for (let i = 0; i < circuits.length; i++) {
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

  canvas.addEventListener("mouseup", (ev) => {
    console.log(ev);
    if (currentlyDragging != null) {
      currentlyDragging.selected = false;
      currentlyDragging = undefined;
    }
    // console.info("dragging end");
  });

  let ctx_ = canvas.getContext("2d");
  if (ctx_ == null) {
    throw Error("Could not get 2d context from canvas");
  }
  ctx = ctx_ as CanvasRenderingContext2D;
}
