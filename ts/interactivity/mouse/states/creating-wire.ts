import { ProducerPin } from "@src/scene-objects/producer-pin.js";
import { ConsumerPin } from "@src/scene-objects/consumer-pin.js";
import { Wire } from "@src/scene-objects/wire.js";
import {
  MouseDownPayload,
  MouseMovePayload,
  MouseState,
  MouseStateMachine,
  MouseUpPayload,
} from "../state-machine.js";
import { Home } from "./home.js";
import { logState, sceneManager } from "@src/main.js";
import { ConcreteObjectKind } from "@src/scene-manager.js";

export class CreatingWire implements MouseState {
  constructor(private wire: Wire) {
    logState("CreatingWire");
    // console.log("Wire: ", wire);
    // console.log("consumerPin: ", wire.getConsumerPin()?.wire);
  }

  mouseDown(stateMachine: MouseStateMachine, payload: MouseDownPayload): void {}

  mouseMove(stateMachine: MouseStateMachine, payload: MouseMovePayload): void {
    if (this.wire.isProducerPinNull()) {
      this.wire.fromScr = payload.locScr;
    } else if (this.wire.isConsumerPinNull()) {
      this.wire.toScr = payload.locScr;
    }
  }

  mouseUp(stateMachine: MouseStateMachine, payload: MouseUpPayload): void {
    const focusObject = sceneManager.getObjectAt(payload.locScr);
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

    console.log("Wire: ", this.wire);
    stateMachine.state = new Home();
  }
}
