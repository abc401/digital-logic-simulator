import { Wire, Circuit } from "./circuit.js";
import { Scheduler } from "./scheduler.js";
import { init as canvasInit, ctx } from "./canvas.js";
canvasInit();
var SHOULD_LOG = false;
if (!SHOULD_LOG) {
    console.log = function () { };
    console.info = function () { };
    console.debug = function () { };
    console.error = function () { };
}
var scheduler = new Scheduler();
//---------------------------------------------------------------------
// S-R Latch
//---------------------------------------------------------------------
var rValue = true;
var sValue = true;
var r = new Circuit(0, 1, scheduler, 30, 30, function (self) {
    self.producerPins[0].setValue(rValue);
}, true);
var s = new Circuit(0, 1, scheduler, 30, 200, function (self) {
    self.producerPins[0].setValue(sValue);
}, true);
var nor1 = new Circuit(2, 1, scheduler, 350, 80, function (self) {
    self.producerPins[0].setValue(!(self.consumerPins[0].value || self.consumerPins[1].value));
});
var nor2 = new Circuit(2, 1, scheduler, 200, 200, function (self) {
    self.producerPins[0].setValue(!(self.consumerPins[0].value || self.consumerPins[1].value));
});
console.log(nor2.rect());
export var circuits = [r, s, nor1, nor2];
export var wires = [
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
    if (SHOULD_LOG)
        console.log("draw");
}
var s_input_dom = document.getElementById("s-input");
if (s_input_dom == null) {
    console.info("DOM element for s input NOT provided.");
}
else {
    sValue = s_input_dom.checked;
    console.info("DOM S provided");
    s_input_dom.onclick = function () {
        console.debug("S clicked.");
        sValue = !sValue;
    };
}
var r_input_dom = document.getElementById("r-input");
if (r_input_dom == null) {
    console.info("DOM element for r input not provided.");
}
else {
    rValue = r_input_dom.checked;
    console.info("DOM R provided");
    r_input_dom.onclick = function () {
        console.debug("R clicked.");
        rValue = !rValue;
    };
}
// document.addEventListener("click", () => {
//   scheduler.tick();
//   draw(ctx);
// });
setInterval(function () { return draw(ctx); }, 1000 / 30);
scheduler.runSim(ctx);
