import { Wire, Circuit } from "./circuit.js";
import { Scheduler } from "./scheduler.js";
export var SHOULD_DEBUG = false;
var scheduler = new Scheduler();
//---------------------------------------------------------------------
// S-R Latch
//---------------------------------------------------------------------
var r = new Circuit(0, 1, scheduler, 30, 30, function (self) {
    self.producerPins[0].setValue(true);
}, true);
var s = new Circuit(0, 1, scheduler, 30, 200, function (self) {
    self.producerPins[0].setValue(true);
}, true);
var nor1 = new Circuit(2, 1, scheduler, 350, 80, function (self) {
    self.producerPins[0].setValue(!(self.consumerPins[0].value && self.consumerPins[1].value));
});
var nor2 = new Circuit(2, 1, scheduler, 200, 200, function (self) {
    self.producerPins[0].setValue(!(self.consumerPins[0].value && self.consumerPins[1].value));
});
var circuits = [r, s, nor1, nor2];
var wires = [
    new Wire(r, 0, nor1, 0, scheduler),
    new Wire(s, 0, nor2, 1, scheduler),
    new Wire(nor1, 0, nor2, 0, scheduler),
    new Wire(nor2, 0, nor1, 1, scheduler),
];
//---------------------------------------------------------------------
// const circuits: Circuit[] = [];
// const wires: Wire[] = [];
export function draw(ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    for (var i = 0; i < wires.length; i++) {
        wires[i].draw(ctx);
    }
    for (var i = 0; i < circuits.length; i++) {
        circuits[i].draw(ctx);
    }
    if (SHOULD_DEBUG)
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
// });
setInterval(function () { return draw(ctx); }, 1000 / 30);
scheduler.runSim(ctx);
