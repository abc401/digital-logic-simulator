import { Queue } from "./queue.js";
import { Circuit } from "./circuit.js";

export class Scheduler {
  static fps = 60;

  currentFrameEvents: Queue<Circuit> = new Queue();
  nextFrameEvents: Queue<Circuit> = new Queue();

  recurringEvents: Circuit[] = [];

  tickNumber: number = 0;

  async sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  tick() {
    this.tickNumber += 1;

    let tmp = this.currentFrameEvents;
    this.currentFrameEvents = this.nextFrameEvents;
    this.nextFrameEvents = tmp;

    for (let i = 0; i < this.recurringEvents.length; i++) {
      this.recurringEvents[i].update(this.recurringEvents[i]);
    }

    let circuit = this.currentFrameEvents.dequeue();
    while (circuit != null) {
      circuit.update(circuit);
      circuit = this.currentFrameEvents.dequeue();
    }
  }

  async runSim(ctx: CanvasRenderingContext2D) {
    while (true) {
      this.tick();
      // console.debug("Queue: ", this.backEventBuffer);
      await this.sleep(1000 / Scheduler.fps);
    }
  }
}

export class RecurringEvent {
  circuit: Circuit;
  interval: number;

  constructor(circuit: Circuit, interval: number) {
    this.circuit = circuit;
    this.interval = interval;
  }
}
