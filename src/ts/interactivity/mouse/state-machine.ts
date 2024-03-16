import { Vec2 } from "@src/math.js";
import { Home } from "./states/home.js";
import { canvas, viewManager } from "@src/main.js";
import { copySelectedToClipboard } from "../common.js";

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
}

export class MouseAction {
  kind: MouseActionKind;
  payload: MouseEvent & { buttonEncoded: number };

  constructor(kind: MouseActionKind, payload: MouseEvent) {
    this.kind = kind;
    this.payload = Object.assign(payload, {
      buttonEncoded: encodeMouseButton(payload.button),
    });
  }
}

export interface MouseState {
  update(stateMachine: MouseStateMachine, action: MouseAction): void;
}

export class MouseStateMachine {
  state: MouseState;

  constructor() {
    this.state = new Home();

    document.addEventListener("keydown", (ev) => {
      if ((ev.key === "c" || ev.key === "C") && ev.ctrlKey) {
        copySelectedToClipboard();
      }
    });

    canvas.addEventListener("mousedown", (ev) => {
      this.state.update(this, new MouseAction(MouseActionKind.MouseDown, ev));
    });

    canvas.addEventListener("mouseup", (ev) => {
      this.state.update(this, new MouseAction(MouseActionKind.MouseUp, ev));
    });

    canvas.addEventListener("mousemove", (ev) => {
      this.state.update(this, new MouseAction(MouseActionKind.MouseMove, ev));
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
