import { ctx, draw } from "./main.js";
import { Queue } from "./queue.js";

export class SimEvent {
  constructor(readonly self: any, readonly handeler: (self: any) => void) {}
}

export class SimEngine {
  static fps = 60;

  paused = true;

  currentFrameEvents: Queue<SimEvent> = new Queue();
  nextFrameEvents: Queue<SimEvent> = new Queue();

  recurringEvents: SimEvent[] = [];

  tickNumber: number = 0;

  async sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  tick() {
    // console.log("Tick start");
    this.tickNumber += 1;

    let tmp = this.currentFrameEvents;
    this.currentFrameEvents = this.nextFrameEvents;
    this.nextFrameEvents = tmp;

    // console.debug("Current: ", this.currentFrameEvents);

    for (let i = 0; i < this.recurringEvents.length; i++) {
      this.recurringEvents[i].handeler(this.recurringEvents[i].self);
    }

    let event = this.currentFrameEvents.dequeue();
    while (event != null) {
      event.handeler(event.self);
      event = this.currentFrameEvents.dequeue();
    }

    draw(ctx);
    // console.debug("Next: ", this.nextFrameEvents);
    // console.log("tick end");
  }
  // ctx: CanvasRenderingContext2D
  async runSim() {
    this.paused = false;
    while (!this.paused) {
      this.tick();
      // console.debug("Queue: ", this.nextFrameEvents);
      await this.sleep(1000 / SimEngine.fps);
    }
  }
}
