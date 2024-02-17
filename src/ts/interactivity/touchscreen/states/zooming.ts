import { canvas, domLog, logState, viewManager } from "@src/main.js";
import {
  TouchEndPayload,
  TouchMovePayload,
  TouchScreenState,
  TouchScreenStateMachine,
  TouchStartPayload,
  findTouch,
} from "../state-machine.js";
import { Rect, Vec2 } from "@src/math.js";
import { Panning } from "./panning.js";
import { Home } from "./home.js";

export class Zooming implements TouchScreenState {
  stateName = "Zooming";
  constructor(private touch1Id: number, private touch2Id: number) {
    logState("TSZooming");
  }
  touchMove(
    stateMachine: TouchScreenStateMachine,
    payload: TouchMovePayload
  ): void {
    const boundingRect = canvas.getBoundingClientRect();

    if (payload.changedTouches.length > 2) {
      domLog("[TSZooming][TouchMove] payload.changedTouches.length > 2");
      throw Error();
    }

    const touch1 = findTouch(this.touch1Id, payload.changedTouches);
    const touch2 = findTouch(this.touch2Id, payload.changedTouches);

    if (touch1 == null && touch2 == null) {
      domLog("[TSZooming][TouchMove] touch1 == null && touch2 == null");
      throw Error();
    }

    const previousLocScr1 = stateMachine.touchLocHistoryScr.get(this.touch1Id);
    const previousLocScr2 = stateMachine.touchLocHistoryScr.get(this.touch2Id);

    if (previousLocScr1 == null || previousLocScr2 == null) {
      domLog("[TSZooming][TouchMove] no previous locations of touches.");
      throw Error();
    }

    const zoomRectPrevious = Rect.fromEndPoints(
      previousLocScr1,
      previousLocScr2
    )
      .forceAspectRatio(1)
      .withMidPoint(previousLocScr1.lerp(previousLocScr2, 1 / 2));

    const touch1LocScr =
      touch1 == null
        ? previousLocScr1
        : new Vec2(
            touch1.clientX - boundingRect.x,
            touch1.clientY - boundingRect.y
          );
    const touch2LocScr =
      touch2 == null
        ? previousLocScr2
        : new Vec2(
            touch2.clientX - boundingRect.x,
            touch2.clientY - boundingRect.y
          );

    const zoomRectCurrent = Rect.fromEndPoints(touch1LocScr, touch2LocScr)
      .forceAspectRatio(1)
      .withMidPoint(touch1LocScr.lerp(touch2LocScr, 1 / 2));
    const zoomOriginScr = zoomRectCurrent.midPoint();
    const newZoomLevel =
      (viewManager.zoomLevel * zoomRectCurrent.w) / zoomRectPrevious.w;
    viewManager.zoom(zoomOriginScr, newZoomLevel);
    viewManager.pan(
      zoomRectCurrent.midPoint().sub(zoomRectPrevious.midPoint())
    );
  }

  touchEnd(
    stateMachine: TouchScreenStateMachine,
    payload: TouchEndPayload
  ): void {
    if (payload.changedTouches.length === 1) {
      const touch = payload.changedTouches[0];
      if (touch.identifier === this.touch1Id) {
        stateMachine.state = new Panning(this.touch2Id);
      } else if (touch.identifier === this.touch2Id) {
        stateMachine.state = new Panning(this.touch1Id);
      } else {
        domLog(
          "[TSZooming][TouchEnd] Ended touch is not one of the touches used for zooming"
        );
        throw Error();
      }
    } else if (payload.changedTouches.length === 2) {
      const touch1 = findTouch(this.touch1Id, payload.changedTouches);
      const touch2 = findTouch(this.touch2Id, payload.changedTouches);
      if (touch1 == null || touch2 == null) {
        domLog(
          "[TSZooming][TouchEnd] Ended touch is not one of the touches used for zooming"
        );
        throw Error();
      }
      stateMachine.state = new Home();
    } else {
      domLog(
        "[TSZooming][TouchEnd] Ended touch is not one of the touches used for zooming"
      );
      throw Error();
    }
  }

  touchStart(
    stateMachine: TouchScreenStateMachine,
    payload: TouchStartPayload
  ): void {}
}
