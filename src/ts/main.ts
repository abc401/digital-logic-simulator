import { Circuit } from "./scene-objects/circuit.js";
import { Wire } from "./scene-objects/wire.js";
import { SimEngine } from "./engine.js";

import { SceneManager, VirtualObject } from "./scene-manager.js";
import { ViewManager } from "./view-manager.js";
import { MouseStateMachine } from "@src/interactivity/mouse/state-machine.js";
import { TouchScreenStateMachine } from "./interactivity/touchscreen/state-machine.js";

export let canvas: HTMLCanvasElement;
let tmp_canvas_ = document.getElementById("main-canvas");
assert(tmp_canvas_ != null, "The dom does not contain a canvas");
canvas = tmp_canvas_ as HTMLCanvasElement;

export let ctx: CanvasRenderingContext2D;
let tmp_ctx_ = canvas.getContext("2d");
assert(tmp_ctx_ != null, "Could not get 2d context from canvas");
ctx = tmp_ctx_ as CanvasRenderingContext2D;

export const loggingDom = document.getElementById("logging");
if (loggingDom == null) {
  console.info("No logging dom!");
}

export const stateDom = document.getElementById("state");
if (stateDom == null) {
  console.log("No State Dom");
}

export let simEngine = new SimEngine();
export let sceneManager = new SceneManager();
export let viewManager = new ViewManager();
export let mouseStateMachine = new MouseStateMachine();
export let touchScreenStateMachine = new TouchScreenStateMachine();

export function domLog(message: string) {
  if (loggingDom == null) {
    return;
  }
  loggingDom.innerHTML += `${message}<br>`;
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

//---------------------------------------------------------------------
// S-R Latch
//---------------------------------------------------------------------

export const r = new Circuit(
  0,
  1,
  30,
  30,
  (self) => {
    // self.producerPins[0].setValue(rValue)
  },
  true
);
const s = new Circuit(
  0,
  1,
  30,
  200,
  (self) => {
    // self.producerPins[0].setValue(sValue);
  },
  true
);

const nor1 = new Circuit(2, 1, 350, 80, (self) => {
  const newValue = !(self.consumerPins[0].value || self.consumerPins[1].value);
  self.producerPins[0].setValue(newValue);
  console.log("[nor1] New value", newValue);
});
const nor2 = new Circuit(2, 1, 200, 200, (self) => {
  const newValue = !(self.consumerPins[0].value || self.consumerPins[1].value);
  self.producerPins[0].setValue(newValue);
  console.log("[nor2] New value", newValue);
});

// console.log(nor2.rectWrl);

// export const wires = [
//   new Wire(r.producerPins[0], nor1.consumerPins[0]),
//   new Wire(s.producerPins[0], nor2.consumerPins[1]),
//   new Wire(nor1.producerPins[0], nor2.consumerPins[0]),
//   new Wire(nor2.producerPins[0], nor1.consumerPins[1]),
// ];

//---------------------------------------------------------------------

export function draw(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  for (let wire of sceneManager.wires.values()) {
    wire.draw(ctx);
  }
  // console.log("Wires Length: ", wires.length);
  for (let circuit of sceneManager.circuits.values()) {
    circuit.draw(ctx);
  }
}

let s_input_dom = document.getElementById("s-input");
if (s_input_dom !== null) {
  s_input_dom.onclick = () => {
    const sValue = (s_input_dom as HTMLInputElement).checked;
    s.producerPins[0].setValue(sValue);
  };
}

let r_input_dom = document.getElementById("r-input");
if (r_input_dom !== null) {
  r_input_dom.onclick = () => {
    const rValue = (r_input_dom as HTMLInputElement).checked;
    r.producerPins[0].setValue(rValue);
  };
}

let tickButton = document.getElementById("tick");
if (tickButton !== null) {
  tickButton.onclick = (ev) => {
    simEngine.tick();
  };
}

let pauseButton = document.getElementById("pause");
if (pauseButton !== null) {
  pauseButton.onclick = (ev) => {
    simEngine.paused = true;
  };
}

let runButton = document.getElementById("run");
if (runButton !== null) {
  runButton.onclick = (ev) => {
    simEngine.runSim();
  };
}

setInterval(function () {
  draw(ctx);
}, 1000 / 30);
// scheduler.runSim(ctx);
