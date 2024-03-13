import { logState, sceneManager, viewManager } from "@src/main.js";
import {
  MouseAction,
  MouseActionKind,
  MouseStateMachine,
  MouseState,
  MouseButton,
  MouseDownPayload,
  MouseMovePayload,
  MouseUpPayload,
} from "../state-machine.js";
import { Panning } from "./panning.js";
import {
  ConcreteObjectKind,
  ColliderObject,
} from "@src/scene/scene-manager.js";
import { Dragging } from "./dragging.js";
import { Circuit } from "@src/scene/objects/circuit.js";
import { ProducerPin } from "@src/scene/objects/producer-pin.js";
import { ConsumerPin } from "@src/scene/objects/consumer-pin.js";
import { Wire } from "@src/scene/objects/wire.js";
import { Circle } from "@src/math.js";
import { CreatingWire } from "./creating-wire.js";
import { CircuitSelected } from "./circuit-selected.js";

export class Home implements MouseState {
  constructor() {
    logState("Home");
  }
  mouseDown(stateMachine: MouseStateMachine, payload: MouseDownPayload): void {
    if (payload.button !== MouseButton.Primary) {
      return;
    }

    let focusObject = sceneManager.getObjectAt(payload.locScr);

    if (focusObject == null) {
      console.log("Focus Object == null");
      stateMachine.state = new Panning();
      return;
    }

    console.log("Focus Object kind: ", focusObject.kind);

    if (focusObject.kind === ConcreteObjectKind.Circuit) {
      let circuit = focusObject.object as Circuit;

      stateMachine.state = new CircuitSelected(
        circuit,
        circuit.tightRectWrl.xy.sub(viewManager.screenToWorld(payload.locScr))
      );
    }

    if (focusObject.kind === ConcreteObjectKind.ProducerPin) {
      const pin = focusObject.object as ProducerPin;
      const wire = new Wire(pin, undefined);
      wire.toScr = payload.locScr;
      stateMachine.state = new CreatingWire(wire);
      return;
    }

    if (focusObject.kind === ConcreteObjectKind.ConsumerPin) {
      const pin = focusObject.object as ConsumerPin;

      if (pin.wire != null) {
        pin.wire.detach();
      }

      const wire = new Wire(undefined, pin);
      wire.fromScr = payload.locScr;

      stateMachine.state = new CreatingWire(wire);
      return;
    }
  }

  mouseMove(manager: MouseStateMachine, payload: MouseMovePayload): void {}

  mouseUp(manager: MouseStateMachine, payload: MouseUpPayload): void {}
}
