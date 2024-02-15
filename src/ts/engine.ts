import { Queue } from "./queue.js";
import { Circuit } from "./interactables.js";

export class SimEvent {
  constructor(readonly self: any, readonly handeler: (self: any) => void) {}
}

export class SimEngine {
  static fps = 60;

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
    // console.debug("Next: ", this.nextFrameEvents);
    // console.log("tick end");
  }

  async runSim(ctx: CanvasRenderingContext2D) {
    while (true) {
      this.tick();
      // console.debug("Queue: ", this.nextFrameEvents);
      await this.sleep(1000 / SimEngine.fps);
    }
  }
}
