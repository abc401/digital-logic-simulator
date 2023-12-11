import { Wire, Circuit } from "./circuit.js";
import { Scheduler, RecurringEvent } from "./scheduler.js";

export const SHOULD_DEBUG = false;

let scheduler = new Scheduler();

//---------------------------------------------------------------------
// S-R Latch
//---------------------------------------------------------------------

let rValue = true;
let sValue = true;

const r = new Circuit(
  0,
  1,
  scheduler,
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
  scheduler,
  30,
  200,
  (self) => {
    self.producerPins[0].setValue(sValue);
  },
  true
);

const nor1 = new Circuit(2, 1, scheduler, 350, 80, (self) => {
  self.producerPins[0].setValue(
    !(self.consumerPins[0].value || self.consumerPins[1].value)
  );
});
const nor2 = new Circuit(2, 1, scheduler, 200, 200, (self) => {
  self.producerPins[0].setValue(
    !(self.consumerPins[0].value || self.consumerPins[1].value)
  );
});

export const circuits = [r, s, nor1, nor2];
export const wires = [
  new Wire(r, 0, nor1, 0, scheduler),
  new Wire(s, 0, nor2, 1, scheduler),
  new Wire(nor1, 0, nor2, 0, scheduler),
  new Wire(nor2, 0, nor1, 1, scheduler),
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
  if (SHOULD_DEBUG) console.log("draw");
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

let canvas = document.getElementById("main-canvas");
if (canvas == null) {
  throw Error("The dom does not contain a canvas");
}

let ctx: CanvasRenderingContext2D;

if ((canvas as HTMLCanvasElement).getContext("2d") != null) {
  ctx = (canvas as HTMLCanvasElement).getContext(
    "2d"
  ) as CanvasRenderingContext2D;
} else {
  throw Error("Could not get 2d context from canvas");
}

// document.addEventListener("click", () => {
//   scheduler.tick();
//   draw(ctx);
// });

setInterval(() => draw(ctx), 1000 / 30);
scheduler.runSim(ctx);
