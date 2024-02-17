import { canvas, domLog, logState, viewManager } from "../../../main.js";
import { Vec2 } from "../../../math.js";
import { Home } from "./home.js";
import { Zooming } from "./zooming.js";
export class Panning {
    constructor(touchId) {
        this.touchId = touchId;
        this.stateName = "Panning";
        logState("TSPanning");
    }
    touchMove(stateMachine, payload) {
        let boundingRect = canvas.getBoundingClientRect();
        if (payload.changedTouches.length !== 1) {
            domLog(`[TSPanning(Err)][TouchMove] payload.changedTouches.length: ${payload.changedTouches.length}`);
            throw Error();
        }
        let touch = payload.changedTouches[0];
        let locScr = new Vec2(touch.clientX - boundingRect.x, touch.clientY - boundingRect.y);
        let previousLocScr = stateMachine.touchLocHistoryScr.get(this.touchId);
        if (previousLocScr == null) {
            domLog(`[TSPanning(Err)][TouchMove] No history for touch location`);
            throw Error();
        }
        viewManager.pan(locScr.sub(previousLocScr));
    }
    touchEnd(stateMachine, payload) {
        if (payload.changedTouches.length !== 1) {
            domLog(`[TSPanning(Err)][TouchEnd] payload.changedTouches.length: ${payload.changedTouches.length}`);
            throw Error();
        }
        stateMachine.state = new Home();
    }
    touchStart(stateMachine, payload) {
        if (payload.changedTouches.length === 1) {
            const touch1Id = this.touchId;
            const touch2Id = payload.changedTouches[0].identifier;
            stateMachine.state = new Zooming(touch1Id, touch2Id);
        }
    }
}
