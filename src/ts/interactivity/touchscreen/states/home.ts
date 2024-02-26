import {
  TouchAction,
  TouchActionKind,
  TouchScreenState,
  TouchScreenStateMachine,
  discriminateTouches,
} from "../state-machine.js";
import { Vec2 } from "@src/math.js";
import {
  sceneManager,
  viewManager,
  logState,
  canvas,
  domLog,
} from "@src/main.js";
import { Circuit } from "@src/scene-objects/circuit.js";
import { Dragging } from "./dragging.js";
import { Panning } from "./panning.js";
import { Zooming } from "./zooming.js";
import { ConcreteObjectKind } from "@src/scene-manager.js";
import { TouchOutsideCanvas } from "./touch-outside-canvas.js";
import { TooManyTouches } from "./too-many-touches.js";
import { ConsumerPin } from "@src/scene-objects/consumer-pin.js";
import { Wire } from "@src/scene-objects/wire.js";
import { CreatingWire } from "./creating-wire.js";
import { ProducerPin } from "@src/scene-objects/producer-pin.js";

export class Home implements TouchScreenState {
  constructor() {
    logState("TSHome");
  }
  update(stateMachine: TouchScreenStateMachine, action: TouchAction): void {
    const payload = action.payload;
    const [insideOfCanvas, outsideOfCanvas] = discriminateTouches(
      payload.changedTouches
    );

    if (outsideOfCanvas.length > 0) {
      stateMachine.state = new TouchOutsideCanvas();
      return;
    }

    let boundingRect = canvas.getBoundingClientRect();

    if (action.kind !== TouchActionKind.TouchStart) {
      return;
    }

    if (insideOfCanvas.length === 1) {
      const touch = insideOfCanvas[0];
      const locScr = new Vec2(
        touch.clientX - boundingRect.x,
        touch.clientY - boundingRect.y
      );

      const focusObject = sceneManager.getObjectAt(locScr);
      if (focusObject == null) {
        stateMachine.state = new Panning(touch.identifier);
        return;
      }

      if (focusObject.kind === ConcreteObjectKind.Circuit) {
        const circuit = focusObject.concreteObject as Circuit;
        stateMachine.state = new Dragging(
          circuit,
          touch.identifier,
          circuit.rectWrl.xy.sub(viewManager.screenToWorld(locScr))
        );
      }
      if (focusObject.kind === ConcreteObjectKind.ConsumerPin) {
        const pin = focusObject.concreteObject as ConsumerPin;

        if (pin.wire != null) {
          pin.wire.detach();
        }

        const wire = new Wire(undefined, pin);
        wire.fromScr = locScr;

        stateMachine.state = new CreatingWire(wire);
        return;
      }
      if (focusObject.kind === ConcreteObjectKind.ProducerPin) {
        const pin = focusObject.concreteObject as ProducerPin;
        let wire = new Wire(pin, undefined);
        wire.toScr = locScr;
        stateMachine.state = new CreatingWire(wire);
        return;
      }
    } else if (insideOfCanvas.length === 2) {
      const touch1 = payload.changedTouches[0];
      const touch2 = payload.changedTouches[1];
      stateMachine.state = new Zooming(touch1.identifier, touch2.identifier);
    } else {
      stateMachine.state = new TooManyTouches();
    }
  }
}
