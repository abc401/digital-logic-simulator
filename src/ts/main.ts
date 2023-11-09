import { Wire, Circuit } from "./circuit.js";
import { Scheduler, RecurringEvent } from "./scheduler.js";

let scheduler = new Scheduler();

const Clock1 = new Circuit(
  0,
  1,
  scheduler,
  30,
  30,
  (self) => {
    let interval = 30;
    self.producerPins[0].setValue(
      self.scheduler.tickNumber % interval > interval / 2
    );
  },
  true
);

const Or = new Circuit(2, 1, scheduler, 300, 30, (self) => {
  self.producerPins[0].setValue(
    self.consumerPins[0].value || self.consumerPins[1].value
  );
});

const Not = new Circuit(1, 1, scheduler, 150, 100, (self) => {
  self.producerPins[0].setValue(!self.consumerPins[0].value);
});

const circuits = [Clock1, Or, Not];
const wires = [
  new Wire(Clock1, 0, Or, 0, scheduler),
  new Wire(Clock1, 0, Not, 0, scheduler),
  new Wire(Not, 0, Or, 1, scheduler),
];

export function draw(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  for (let i = 0; i < wires.length; i++) {
    wires[i].draw(ctx);
  }
  for (let i = 0; i < circuits.length; i++) {
    circuits[i].draw(ctx);
  }
  console.log("draw");
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
//   console.debug("Queue: ", scheduler.backEventBuffer);
// });
// scheduler.runSim(ctx);
