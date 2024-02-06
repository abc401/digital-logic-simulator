import { Vec2 } from "@src/math.js";
import { Home } from "./states/home.js";

export let zoomLevel = 1;
export let panOffset = new Vec2(0, 0);

export enum MouseButton {
  Primary = 0,
  Auxiliary = 1,
  Secondary = 2,
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
    readonly loc: Vec2,
    readonly button: number,
    readonly buttons: number
  ) {}
}

export class MouseUpPayload implements ActionPayload {
  constructor(readonly button: number, readonly buttons: number) {}
}

export class MouseMovePayload implements ActionPayload {
  constructor(readonly loc: Vec2, readonly movement: Vec2) {}
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
      this.state.update(
        this,
        new Action(
          ActionKind.MouseDown,
          new MouseDownPayload(
            new Vec2(ev.offsetX, ev.offsetY),
            ev.button,
            ev.buttons
          )
        )
      );
    });

    canvas.addEventListener("mouseup", (ev) => {
      if (ev.button & ev.buttons) {
        console.log("[MouseUp] ev.button is included in ev.buttons");
      }

      this.state.update(
        this,
        new Action(
          ActionKind.MouseUp,
          new MouseUpPayload(ev.button, ev.buttons)
        )
      );
    });

    canvas.addEventListener("mousemove", (ev) => {
      this.state.update(
        this,
        new Action(
          ActionKind.MouseMove,
          new MouseMovePayload(
            new Vec2(ev.offsetX, ev.offsetY),
            new Vec2(ev.movementX, ev.movementY)
          )
        )
      );
    });
  }
}
