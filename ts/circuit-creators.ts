import {
  Circuit,
  InputCircuit,
  ProcessingCircuit,
} from "./scene-objects/circuit.js";
export let creators: Map<string, () => Circuit> = new Map([
  [
    "Input",
    () => {
      return new InputCircuit(false, 0, 0);
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
