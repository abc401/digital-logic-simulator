import { Vec2 } from "@src/math.js";
import { Home } from "./states/home.js";
import { viewManager } from "@src/main.js";

export enum MouseButton {
  None = 0,
  Primary = 1,
  Secondary = 2,
  Auxiliary = 4,
  Fourth = 8,
  Fifth = 16,
}

function encodeMouseButton(button: number) {
  if (button === 0) {
    return MouseButton.Primary;
  }
  if (button === 1) {
    return MouseButton.Auxiliary;
  }
  if (button === 2) {
    return MouseButton.Secondary;
  }
  if (button === 3) {
    return MouseButton.Fourth;
  }
  if (button === 4) {
    return MouseButton.Fifth;
  }
  throw Error(`Unexpected Mouse Button: ${button}`);
}

export enum ActionKind {
  MouseDown,
  MouseUp,
  MouseMove,
  Scroll,
}

export interface ActionPayload {}

export class Action {
  kind: ActionKind;
  payload: ActionPayload;

  constructor(kind: ActionKind, payload: ActionPayload) {
    this.kind = kind;
    this.payload = payload;
  }
}

export class MouseDownPayload implements ActionPayload {
  constructor(
    readonly locScr: Vec2,
    readonly button: number,
    readonly buttons: number
  ) {}
}

export class MouseUpPayload implements ActionPayload {
  constructor(readonly button: number, readonly buttons: number) {}
}

export class MouseMovePayload implements ActionPayload {
  constructor(
    readonly locScr: Vec2,
    readonly deltaScr: Vec2,
    readonly buttons: number
  ) {}
}

export interface InteractivityManagerState {
  update(manager: InteractivityManager, action: Action): void;
}

export class InteractivityManager {
  canvas: HTMLCanvasElement;
  state: InteractivityManagerState;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.state = new Home();

    canvas.addEventListener("mousedown", (ev) => {
      let payload = new MouseDownPayload(
        new Vec2(ev.offsetX, ev.offsetY),
        encodeMouseButton(ev.button),
        ev.buttons
      );
      this.state.update(this, new Action(ActionKind.MouseDown, payload));
    });

    canvas.addEventListener("mouseup", (ev) => {
      let payload = new MouseUpPayload(
        encodeMouseButton(ev.button),
        ev.buttons
      );

      this.state.update(this, new Action(ActionKind.MouseUp, payload));
    });

    canvas.addEventListener("mousemove", (ev) => {
      let payload = new MouseMovePayload(
        new Vec2(ev.offsetX, ev.offsetY),
        new Vec2(ev.movementX, ev.movementY),
        ev.buttons
      );
      this.state.update(this, new Action(ActionKind.MouseMove, payload));
    });
    canvas.addEventListener("wheel", (ev) => {
      viewManager.zoom(
        new Vec2(ev.offsetX, ev.offsetY),
        viewManager.zoomLevel - ev.deltaY * 0.001
      );

      ev.preventDefault();
    });
  }
}
