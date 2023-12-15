import { Circuit } from "./circuit.js";
import { circuits } from "./main.js";
import { Point, pointRectIntersection } from "./math.js";

export let canvas: HTMLCanvasElement;
export let ctx: CanvasRenderingContext2D;

const loggingDom = document.getElementById("logging");
if (loggingDom == null) {
  console.info("No logging dom!");
}

let selectedCircuit: Circuit | undefined = undefined;
let mouseOffsetWrtRect: Point;
let touchIdentifier: number | undefined = undefined;

function getCircuitUnderMouse(mouse: Point) {
  for (let i = 0; i < circuits.length; i++) {
    const circuitRect = circuits[i].rect();
    if (pointRectIntersection(mouse, circuitRect)) {
      mouseOffsetWrtRect = new Point(
        circuitRect.x - mouse.x,
        circuitRect.y - mouse.y
      );
      circuits[i].isBeingHovered = true;
      return circuits[i];
    }
  }
  return undefined;
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
    let offset = new Point(ev.offsetX, ev.offsetY);
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

  canvas.addEventListener("mousemove", (ev) => {
    if (selectedCircuit == null) {
      let mouse = new Point(ev.offsetX, ev.offsetY);
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
    selectedCircuit.pos_x = ev.offsetX + mouseOffsetWrtRect.x;
    selectedCircuit.pos_y = ev.offsetY + mouseOffsetWrtRect.y;
  });
  canvas.addEventListener("touchmove", (ev) => {
    if (touchIdentifier == null || selectedCircuit == null) {
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

    selectedCircuit.pos_x = offset.x + mouseOffsetWrtRect.x;
    selectedCircuit.pos_y = offset.y + mouseOffsetWrtRect.y;
  });
  // -----------------------------------------------------------

  canvas.addEventListener("mouseup", (ev) => {
    if (selectedCircuit == null) {
      return;
    }
    if (loggingDom != null) {
      loggingDom.innerHTML = "";
    }
    selectedCircuit.isBeingHovered = false;
    selectedCircuit = undefined;
  });
  const touchend = (ev: TouchEvent) => {
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
