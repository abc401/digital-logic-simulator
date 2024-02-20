import { Vec2 } from "@src/math.js";
import { Home } from "./states/home.js";
import { Panning } from "./states/panning.js";
import { Zooming } from "./states/zooming.js";
import { canvas, domLog } from "@src/main.js";
import { TooManyTouches } from "./states/too-many-touches.js";

export function getAppropriateState(touches: TouchList) {
  if (touches.length === 0) {
    return new Home();
  }

  if (touches.length === 1) {
    return new Panning(touches[0].identifier);
  }

  if (touches.length === 2) {
    return new Zooming(touches[0].identifier, touches[1].identifier);
  }

  return new TooManyTouches();
}

export function discriminateTouches(touches: TouchList) {
  let insideOfCanvas = new Array<Touch>();
  let outsideOfCanvas = new Array<Touch>();

  for (let i = 0; i < touches.length; i++) {
    if (touches[i].target === canvas) {
      insideOfCanvas.push(touches[i]);
    } else {
      outsideOfCanvas.push(touches[i]);
    }
  }
  return [insideOfCanvas, outsideOfCanvas];
}

export enum TouchActionKind {
  TouchStart,
  TouchMove,
  TouchEnd,
}

export class TouchAction {
  constructor(readonly kind: TouchActionKind, readonly payload: TouchEvent) {}
}

export interface TouchScreenState {
  update(stateMachine: TouchScreenStateMachine, action: TouchAction): void;
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

    document.addEventListener("touchstart", (ev) => {
      this.state.update(this, new TouchAction(TouchActionKind.TouchStart, ev));

      const boundingRect = canvas.getBoundingClientRect();
      for (let i = 0; i < ev.changedTouches.length; i++) {
        const touch = ev.changedTouches[i];
        this.touchLocHistoryScr.set(
          touch.identifier,
          new Vec2(
            touch.clientX - boundingRect.x,
            touch.clientY - boundingRect.y
          )
        );
      }
    });

    document.addEventListener("touchmove", (ev) => {
      this.state.update(this, new TouchAction(TouchActionKind.TouchMove, ev));

      const boundingRect = canvas.getBoundingClientRect();
      for (let i = 0; i < ev.changedTouches.length; i++) {
        const touch = ev.changedTouches[i];
        this.touchLocHistoryScr.set(
          touch.identifier,
          new Vec2(
            touch.clientX - boundingRect.x,
            touch.clientY - boundingRect.y
          )
        );
      }
    });

    document.addEventListener("touchcancel", (ev) => {
      this.state.update(this, new TouchAction(TouchActionKind.TouchEnd, ev));

      for (let i = 0; i < ev.changedTouches.length; i++) {
        this.touchLocHistoryScr.delete(ev.changedTouches[i].identifier);
      }
    });

    document.addEventListener("touchend", (ev) => {
      this.state.update(this, new TouchAction(TouchActionKind.TouchEnd, ev));

      for (let i = 0; i < ev.changedTouches.length; i++) {
        this.touchLocHistoryScr.delete(ev.changedTouches[i].identifier);
      }
    });
  }
}
