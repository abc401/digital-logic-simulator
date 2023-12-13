import { Circuit } from "./circuit.js";
import { circuits } from "./main.js";
import { Point, pointRectIntersection } from "./math.js";

export let canvas: HTMLCanvasElement;
export let ctx: CanvasRenderingContext2D;

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

export function init() {
  let canvas_ = document.getElementById("main-canvas");
  if (canvas_ == null) {
    throw Error("The dom does not contain a canvas");
  }
  canvas = canvas_ as HTMLCanvasElement;
  canvas.addEventListener("mousedown", (ev) => {
    let mouse = new Point(ev.offsetX, ev.offsetY);
    console.debug(mouse);
    currentlyDragging = getCurrentlySelectedCircuit(mouse);
  });

  canvas.addEventListener("mousemove", (ev) => {
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
    console.info("dragging");
  });

  canvas.addEventListener("mouseup", (ev) => {
    if (currentlyDragging != null) {
      currentlyDragging.selected = false;
      currentlyDragging = undefined;
    }
    console.info("dragging end");
  });

  let ctx_ = canvas.getContext("2d");
  if (ctx_ == null) {
    throw Error("Could not get 2d context from canvas");
  }
  ctx = ctx_ as CanvasRenderingContext2D;
}
