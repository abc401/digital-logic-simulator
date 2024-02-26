import { Wire } from "@src/scene-objects/wire.js";
import {
  TouchAction,
  TouchActionKind,
  TouchScreenState,
  TouchScreenStateMachine,
  discriminateTouches,
} from "../state-machine.js";
import { TouchOutsideCanvas } from "./touch-outside-canvas.js";
import { TooManyTouches } from "./too-many-touches.js";
import { canvas, sceneManager } from "@src/main.js";
import { Vec2 } from "@src/math.js";
import { ConcreteObjectKind } from "@src/scene-manager.js";
import { ConsumerPin } from "@src/scene-objects/consumer-pin.js";
import { ProducerPin } from "@src/scene-objects/producer-pin.js";
import { Home } from "./home.js";

export class CreatingWire implements TouchScreenState {
  constructor(private wire: Wire) {}
  update(stateMachine: TouchScreenStateMachine, action: TouchAction): void {
    const payload = action.payload;
    const [insideOfCanvas, outsideOfCanvas] = discriminateTouches(
      payload.changedTouches
    );

    let boundingRect = canvas.getBoundingClientRect();

    if (outsideOfCanvas.length > 0) {
      this.wire.detach();
      stateMachine.state = new TouchOutsideCanvas();
      return;
    }
    if (action.kind === TouchActionKind.TouchStart) {
      this.wire.detach();
      stateMachine.state = new TooManyTouches();
      return;
    }

    const touch = payload.changedTouches[0];

    const locScr = new Vec2(
      touch.clientX - boundingRect.x,
      touch.clientY - boundingRect.y
    );

    if (action.kind === TouchActionKind.TouchMove) {
      if (this.wire.isProducerPinNull()) {
        this.wire.fromScr = locScr;
      } else if (this.wire.isConsumerPinNull()) {
        this.wire.toScr = locScr;
      }
    }
    if (action.kind === TouchActionKind.TouchEnd) {
      const focusObject = sceneManager.getObjectAt(locScr);
      if (focusObject == null) {
        this.wire.detach();
      } else if (
        focusObject.kind === ConcreteObjectKind.ConsumerPin &&
        this.wire.isConsumerPinNull()
      ) {
        this.wire.setConsumerPin(focusObject.concreteObject as ConsumerPin);
      } else if (
        focusObject.kind === ConcreteObjectKind.ProducerPin &&
        this.wire.isProducerPinNull()
      ) {
        this.wire.setProducerPin(focusObject.concreteObject as ProducerPin);
      } else {
        this.wire.detach();
      }
      stateMachine.state = new Home();
    }
  }
}
