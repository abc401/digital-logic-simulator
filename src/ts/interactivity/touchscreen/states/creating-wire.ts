// import {
//   MouseDownPayload,
//   MouseMovePayload,
//   MouseState,
//   MouseStateMachine,
//   MouseUpPayload,
// } from "@src/interactivity/mouse/state-machine.js";
// import { logState, sceneManager } from "@src/main.js";
// import { ConcreteObjectKind } from "@src/scene-manager";
// import { ConsumerPin } from "@src/scene-objects/consumer-pin";
// import { ProducerPin } from "@src/scene-objects/producer-pin";
// import { Wire } from "@src/scene-objects/wire.js";
// import { Home } from "./home";
// import {
//   TouchMovePayload,
//   TouchScreenState,
//   TouchScreenStateMachine,
//   TouchStartPayload,
//   findTouch,
// } from "../state-machine";

// export class CreatingWire implements TouchScreenState {
//   constructor(private wire: Wire, private touchId: number) {
//     logState("CreatingWire");
//   }

//   touchStart(
//     stateMachine: TouchScreenStateMachine,
//     payload: TouchStartPayload
//   ): void {}

//   touchMove(
//     stateMachine: TouchScreenStateMachine,
//     payload: TouchMovePayload
//   ): void {
//     const touch = findTouch(this.touchId, payload.changedTouches);
//     if (touch == null) {
//       return;
//     }

//     const locScr = touch?.clientX;
//     if (this.wire.isProducerPinNull()) {
//       this.wire.fromScr = payload.locScr;
//     } else if (this.wire.isConsumerPinNull()) {
//       this.wire.toScr = payload.locScr;
//     }
//   }
//   mouseMove(stateMachine: MouseStateMachine, payload: MouseMovePayload): void {
//     if (this.wire.isProducerPinNull()) {
//       this.wire.fromScr = payload.locScr;
//     } else if (this.wire.isConsumerPinNull()) {
//       this.wire.toScr = payload.locScr;
//     }
//   }

//   mouseUp(stateMachine: MouseStateMachine, payload: MouseUpPayload): void {
//     const focusObject = sceneManager.getObjectAt(payload.locScr);
//     if (focusObject == null) {
//       this.wire.detach();
//     } else if (
//       focusObject.kind === ConcreteObjectKind.ConsumerPin &&
//       this.wire.isConsumerPinNull()
//     ) {
//       this.wire.setConsumerPin(focusObject.concreteObject as ConsumerPin);
//     } else if (
//       focusObject.kind === ConcreteObjectKind.ProducerPin &&
//       this.wire.isProducerPinNull()
//     ) {
//       this.wire.setProducerPin(focusObject.concreteObject as ProducerPin);
//     } else {
//       this.wire.detach();
//     }

//     console.log("Wire: ", this.wire);
//     stateMachine.state = new Home();
//   }
// }
