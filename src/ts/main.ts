import { Wire, Circuit } from "./circuit.js";
import { Scheduler } from "./scheduler.js";

import { canvas, createCanvas as canvasInit, ctx } from "./canvas.js";
import { SceneManager, VirtualObject } from "./scene-manager.js";
import { ViewManager } from "./view-manager.js";
import { MouseStateMachine } from "@src/interactivity/mouse/state-machine.js";
import { TouchScreenStateMachine } from "./interactivity/touchscreen/state-machine.js";
canvasInit();

export const loggingDom = document.getElementById("logging");
if (loggingDom == null) {
  console.info("No logging dom!");
}
export function domLog(message: string) {
  if (loggingDom == null) {
    return;
  }
  loggingDom.innerHTML += `${message}<br>`;
}

export const stateDom = document.getElementById("state");
if (stateDom == null) {
  console.log("No State Dom");
}
export function logState(message: string) {
  if (stateDom == null) {
    return;
  }
  stateDom.innerHTML = `${message}<br>`;
}

export function assert(
  condition: boolean,
  message: string | undefined = undefined
) {
  if (condition) {
    return;
  }
  if (message == null) {
    logState("Assertion failed");
    throw Error();
  } else {
    logState(message);
  }
  throw Error(message);
}

export let scheduler = new Scheduler();
export let sceneManager = new SceneManager();
export let viewManager = new ViewManager();
export let mouseStateMachine = new MouseStateMachine();
export let touchScreenStateMachine = new TouchScreenStateMachine();

//---------------------------------------------------------------------
// S-R Latch
//---------------------------------------------------------------------

let rValue = true;
let sValue = true;

export const r = new Circuit(
  0,
  1,
  30,
  30,
  (self) => {
    self.producerPins[0].setValue(rValue);
  },
  true
);
const s = new Circuit(
  0,
  1,
  30,
  200,
  (self) => {
    self.producerPins[0].setValue(sValue);
  },
  true
);

const nor1 = new Circuit(2, 1, 350, 80, (self) => {
  self.producerPins[0].setValue(
    !(self.consumerPins[0].value || self.consumerPins[1].value)
  );
});
const nor2 = new Circuit(2, 1, 200, 200, (self) => {
  self.producerPins[0].setValue(
    !(self.consumerPins[0].value || self.consumerPins[1].value)
  );
});

console.log(nor2.rectWrl);

export const circuits = [r, s, nor1, nor2];
export const wires = [
  new Wire(r, 0, nor1, 0),
  new Wire(s, 0, nor2, 1),
  new Wire(nor1, 0, nor2, 0),
  new Wire(nor2, 0, nor1, 1),
];

//---------------------------------------------------------------------

// const circuits: Circuit[] = [];
// const wires: Wire[] = [];

export function draw(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  for (let i = 0; i < wires.length; i++) {
    wires[i].draw(ctx);
  }
  for (let i = 0; i < circuits.length; i++) {
    circuits[i].draw(ctx);
  }
}

let s_input_dom = document.getElementById("s-input");
if (s_input_dom == null) {
  console.info("DOM element for s input NOT provided.");
} else {
  sValue = (s_input_dom as HTMLInputElement).checked;
  console.info("DOM S provided");
  s_input_dom.onclick = () => {
    console.debug("S clicked.");
    sValue = !sValue;
  };
}

let r_input_dom = document.getElementById("r-input");
if (r_input_dom == null) {
  console.info("DOM element for r input not provided.");
} else {
  rValue = (r_input_dom as HTMLInputElement).checked;
  console.info("DOM R provided");
  r_input_dom.onclick = () => {
    console.debug("R clicked.");
    rValue = !rValue;
  };
}

// document.addEventListener("click", () => {
//   scheduler.tick();
//   draw(ctx);
// });

setInterval(function () {
  draw(ctx);
}, 1000 / 30);
scheduler.runSim(ctx);
