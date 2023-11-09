import { Queue } from "./queue.js";
import { Circuit } from "./circuit.js";
import { draw } from "./main.js";

export class Scheduler {
  frontEventBuffer: Queue<Circuit> = new Queue();
  backEventBuffer: Queue<Circuit> = new Queue();

  recurringEvents: Circuit[] = [];

  tickNumber: number = 0;

  async sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  tick() {
    this.tickNumber += 1;

    let tmp = this.frontEventBuffer;
    this.frontEventBuffer = this.backEventBuffer;
    this.backEventBuffer = tmp;

    for (let i = 0; i < this.recurringEvents.length; i++) {
      this.recurringEvents[i].update(this.recurringEvents[i]);
    }

    let circuit = this.frontEventBuffer.dequeue();
    while (circuit != null) {
      circuit.update(circuit);
      circuit = this.frontEventBuffer.dequeue();
    }
  }

  async runSim(ctx: CanvasRenderingContext2D) {
    while (true) {
      this.tick();
      draw(ctx);
      console.debug("Queue: ", this.backEventBuffer);
      await this.sleep(1000 / 30);
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
