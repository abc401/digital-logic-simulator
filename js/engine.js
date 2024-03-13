var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { sceneManager } from "./main.js";
import { Queue } from "./queue.js";
export class SimEvent {
    constructor(self, handeler) {
        this.self = self;
        this.handeler = handeler;
    }
}
export class SimEngine {
    constructor() {
        this.paused = true;
        this.currentFrameEvents = new Queue();
        this.nextFrameEvents = new Queue();
        this.recurringEvents = [];
        this.tickNumber = 0;
    }
    sleep(ms) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => setTimeout(resolve, ms));
        });
    }
    tick() {
        console.log("Tick start");
        this.tickNumber += 1;
        let tmp = this.currentFrameEvents;
        this.currentFrameEvents = this.nextFrameEvents;
        this.nextFrameEvents = tmp;
        console.debug("Current: ", this.currentFrameEvents);
        for (let i = 0; i < this.recurringEvents.length; i++) {
            this.recurringEvents[i].handeler(this.recurringEvents[i].self);
        }
        let event = this.currentFrameEvents.dequeue();
        while (event != null) {
            event.handeler(event.self);
            event = this.currentFrameEvents.dequeue();
        }
        // draw(ctx);
        console.debug("Next: ", this.nextFrameEvents);
        console.log("tick end");
        console.log("Scene 1: ", sceneManager.scenes.get(1));
    }
    // ctx: CanvasRenderingContext2D
    runSim() {
        return __awaiter(this, void 0, void 0, function* () {
            this.paused = false;
            while (!this.paused) {
                this.tick();
                // console.debug("Queue: ", this.nextFrameEvents);
                yield this.sleep(1000 / SimEngine.fps);
            }
        });
    }
}
SimEngine.fps = 60;
