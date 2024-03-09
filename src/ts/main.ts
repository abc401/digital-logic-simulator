import { Circuit } from "./scene/objects/circuit.js";
import { Wire } from "./scene/objects/wire.js";
import { SimEngine } from "./engine.js";

import { SceneManager, ColliderObject } from "./scene/scene-manager.js";
import { ViewManager } from "./view-manager.js";
import { MouseStateMachine } from "@src/interactivity/mouse/state-machine.js";
import { TouchScreenStateMachine } from "./interactivity/touchscreen/state-machine.js";
import { creators } from "./circuit-creators.js";
import { CreatingCircuit as CreatingCircuitMouse } from "./interactivity/mouse/states/creating-circuit.js";
import { CreatingCircuit as CreatingCircuitTouchScreen } from "./interactivity/touchscreen/states/creating-circuit.js";

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

export const stateDom = document.querySelector("#canvas-state");
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

function populateUI() {
  let circuitButtons = document.getElementById("circuit-buttons");
  if (circuitButtons == null) {
    domLog("[Error] No container for circuit buttons");
    throw Error();
  }
  for (let [name, creator] of creators.entries()) {
    let button = document.createElement("button");
    button.innerHTML = name;
    button.onclick = (ev) => {
      console.log(`${name} clicked`);
      mouseStateMachine.state = new CreatingCircuitMouse(name, creator);
      touchScreenStateMachine.state = new CreatingCircuitTouchScreen(
        name,
        creator
      );
    };
    circuitButtons.appendChild(button);
  }
}
populateUI();

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
  sceneManager.draw(ctx);
}, 1000 / 60);
// scheduler.runSim(ctx);
