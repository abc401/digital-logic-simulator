import { canvas } from "@src/canvas.js";
import { Vec2 } from "@src/math.js";
import { Home } from "./states/home.js";
import { Panning } from "./states/panning.js";
import { Zooming } from "./states/zooming.js";

interface TouchActionPayload {}

export class TouchStartPayload implements TouchActionPayload {
  constructor(readonly changedTouches: Touch[]) {}
}

export class TouchMovePayload implements TouchActionPayload {
  constructor(readonly changedTouches: TouchList) {}
}

export class TouchEndPayload implements TouchActionPayload {
  constructor(readonly changedTouches: TouchList) {}
}

export interface TouchScreenState {
  stateName: string;
  touchStart(
    stateMachine: TouchScreenStateMachine,
    payload: TouchStartPayload
  ): void;

  touchMove(
    stateMachine: TouchScreenStateMachine,
    payload: TouchMovePayload
  ): void;

  touchEnd(
    stateMachine: TouchScreenStateMachine,
    payload: TouchEndPayload
  ): void;
}

export function findTouch(id: number, touchList: TouchList) {
  for (let i = 0; i < touchList.length; i++) {
    if (touchList[i].identifier == id) {
      return touchList[i];
    }
  }
  return undefined;
}

export class TouchScreenStateMachine {
  state: TouchScreenState;
  touchLocHistoryScr: Map<number, Vec2>;

  constructor() {
    this.state = new Home();
    this.touchLocHistoryScr = new Map();
    document.addEventListener("touchmove", (ev) => {
      if (this.state.stateName === "Home") {
        return;
      }
      ev.preventDefault();
    });

    canvas.addEventListener("touchstart", (ev) => {
      console.log("Touchstart");
      ev.preventDefault();
      let relaventTouches = new Array<Touch>();

      for (let i = 0; i < ev.changedTouches.length; i++) {
        let touch = ev.changedTouches[i];
        if (touch.target === canvas) {
          relaventTouches.push(touch);
        }
      }
      if (relaventTouches.length === 0) {
        return;
      }

      this.state.touchStart(this, new TouchStartPayload(relaventTouches));

      let boundingRect = canvas.getBoundingClientRect();
      for (let i = 0; i < relaventTouches.length; i++) {
        let touch = relaventTouches[i];
        this.touchLocHistoryScr.set(
          touch.identifier,
          new Vec2(
            touch.clientX - boundingRect.x,
            touch.clientY - boundingRect.y
          )
        );
      }
    });

    canvas.addEventListener("touchmove", (ev) => {
      console.log("touchmove");
      ev.preventDefault();

      this.state.touchMove(this, new TouchMovePayload(ev.changedTouches));

      let boundingRect = canvas.getBoundingClientRect();
      for (let i = 0; i < ev.changedTouches.length; i++) {
        let touch = ev.changedTouches[i];
        this.touchLocHistoryScr.set(
          touch.identifier,
          new Vec2(
            touch.clientX - boundingRect.x,
            touch.clientY - boundingRect.y
          )
        );
      }
    });

    canvas.addEventListener("touchcancel", (ev) => {
      ev.preventDefault();
      this.state.touchEnd(this, new TouchEndPayload(ev.changedTouches));
    });

    canvas.addEventListener("touchend", (ev) => {
      console.log("touchend");
      ev.preventDefault();

      this.state.touchEnd(this, new TouchEndPayload(ev.changedTouches));

      for (let i = 0; i < ev.changedTouches.length; i++) {
        this.touchLocHistoryScr.delete(ev.changedTouches[i].identifier);
      }
    });
  }
}
