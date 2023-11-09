import { Wire, Circuit } from "./circuit.js";
import { Scheduler } from "./scheduler.js";
var scheduler = new Scheduler();
var Clock1 = new Circuit(0, 1, scheduler, 30, 30, function (self) {
    var interval = 30;
    self.producerPins[0].setValue(self.scheduler.tickNumber % interval > interval / 2);
}, true);
var Or = new Circuit(2, 1, scheduler, 300, 30, function (self) {
    self.producerPins[0].setValue(self.consumerPins[0].value || self.consumerPins[1].value);
});
var Not = new Circuit(1, 1, scheduler, 150, 100, function (self) {
    self.producerPins[0].setValue(!self.consumerPins[0].value);
});
var circuits = [Clock1, Or, Not];
var wires = [
    new Wire(Clock1, 0, Or, 0, scheduler),
    new Wire(Clock1, 0, Not, 0, scheduler),
    new Wire(Not, 0, Or, 1, scheduler),
];
export function draw(ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    for (var i = 0; i < wires.length; i++) {
        wires[i].draw(ctx);
    }
    for (var i = 0; i < circuits.length; i++) {
        circuits[i].draw(ctx);
    }
    console.log("draw");
}
var canvas = document.getElementById("main-canvas");
if (canvas == null) {
    throw Error("The dom does not contain a canvas");
}
var ctx;
if (canvas.getContext("2d") != null) {
    ctx = canvas.getContext("2d");
}
else {
    throw Error("Could not get 2d context from canvas");
}
// document.addEventListener("click", () => {
//   scheduler.tick();
//   draw(ctx);
//   console.debug("Queue: ", scheduler.backEventBuffer);
// });
scheduler.runSim(ctx);
