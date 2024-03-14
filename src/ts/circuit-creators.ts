import { customCircuitScenes, domLog } from "./main.js";
import {
  Circuit,
  CustomCircuit,
  CustomCircuitInputs,
  CustomCircuitOutputs,
  InputCircuit,
  ProcessingCircuit,
} from "./scene/objects/circuit.js";
export let customCircuitCreator = (circuitName: string) => () => {
  const sceneId = customCircuitScenes.get(circuitName);
  if (sceneId == null) {
    domLog(`[CircuitCreator][${circuitName}] sceneId == null`);
    throw Error();
  }
  return new CustomCircuit(sceneId, 0, 0);
};

export let creators: Map<string, () => Circuit> = new Map([
  [
    "Input",
    () => {
      return new InputCircuit(false, 0, 0);
    },
  ],
  [
    "CustomCircuitInputs",
    () => {
      return new CustomCircuitInputs(0, 0);
    },
  ],
  [
    "CustomCircuitOutputs",
    () => {
      return new CustomCircuitOutputs(0, 0);
    },
  ],

  [
    "And",
    () => {
      return new ProcessingCircuit(
        2,
        1,
        (self) => {
          self.producerPins[0].setValue(
            self.consumerPins[0].value && self.consumerPins[1].value
          );
        },
        0,
        0
      );
    },
  ],
  [
    "Or",
    () => {
      return new ProcessingCircuit(
        2,
        1,
        (self) => {
          self.producerPins[0].setValue(
            self.consumerPins[0].value || self.consumerPins[1].value
          );
        },
        0,
        0
      );
    },
  ],
  [
    "Not",
    () => {
      return new ProcessingCircuit(
        1,
        1,
        (self) => {
          self.producerPins[0].setValue(!self.consumerPins[0].value);
        },
        0,
        0
      );
    },
  ],
  [
    "Nand",
    () => {
      return new ProcessingCircuit(
        2,
        1,
        (self) => {
          self.producerPins[0].setValue(
            !(self.consumerPins[0].value && self.consumerPins[1].value)
          );
        },
        0,
        0
      );
    },
  ],
  [
    "Nor",
    () => {
      return new ProcessingCircuit(
        2,
        1,
        (self) => {
          self.producerPins[0].setValue(
            !(self.consumerPins[0].value || self.consumerPins[1].value)
          );
        },
        0,
        0
      );
    },
  ],
]);
