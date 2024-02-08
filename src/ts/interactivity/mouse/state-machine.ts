import { Vec2 } from "@src/math.js";
import { Home } from "./states/home.js";
import { viewManager } from "@src/main.js";
import { canvas } from "@src/canvas.js";

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

export enum MouseActionKind {
  MouseDown,
  MouseUp,
  MouseMove,
  Scroll,
}

export interface MouseActionPayload {}

export class MouseAction {
  kind: MouseActionKind;
  payload: MouseActionPayload;

  constructor(kind: MouseActionKind, payload: MouseActionPayload) {
    this.kind = kind;
    this.payload = payload;
  }
}

export class MouseDownPayload implements MouseActionPayload {
  constructor(
    readonly locScr: Vec2,
    readonly button: number,
    readonly buttons: number
  ) {}
}

export class MouseUpPayload implements MouseActionPayload {
  constructor(readonly button: number, readonly buttons: number) {}
}

export class MouseMovePayload implements MouseActionPayload {
  constructor(
    readonly locScr: Vec2,
    readonly deltaScr: Vec2,
    readonly buttons: number
  ) {}
}

export interface MouseState {
  update(manager: MouseStateMachine, action: MouseAction): void;
}

export class MouseStateMachine {
  state: MouseState;

  constructor() {
    this.state = new Home();

    canvas.addEventListener("mousedown", (ev) => {
      let payload = new MouseDownPayload(
        new Vec2(ev.offsetX, ev.offsetY),
        encodeMouseButton(ev.button),
        ev.buttons
      );
      this.state.update(
        this,
        new MouseAction(MouseActionKind.MouseDown, payload)
      );
    });

    canvas.addEventListener("mouseup", (ev) => {
      let payload = new MouseUpPayload(
        encodeMouseButton(ev.button),
        ev.buttons
      );

      this.state.update(
        this,
        new MouseAction(MouseActionKind.MouseUp, payload)
      );
    });

    canvas.addEventListener("mousemove", (ev) => {
      let payload = new MouseMovePayload(
        new Vec2(ev.offsetX, ev.offsetY),
        new Vec2(ev.movementX, ev.movementY),
        ev.buttons
      );
      this.state.update(
        this,
        new MouseAction(MouseActionKind.MouseMove, payload)
      );
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
