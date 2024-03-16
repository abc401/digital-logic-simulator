import { customCircuitScenes, domLog, sceneManager } from "./main.js";
import {
  Circuit,
  CircuitSceneObject,
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
  const scene = sceneManager.scenes.get(sceneId);
  if (scene == null) {
    throw Error();
  }

  if (scene.customCircuitInputs == null) {
    throw Error();
  }
  if (scene.customCircuitOutputs == null) {
    throw Error();
  }

  const customInputs_ = scene.objects.get(scene.customCircuitInputs);
  if (customInputs_ == null) {
    throw Error();
  }
  const customInputs = (customInputs_ as CircuitSceneObject)
    .parentCircuit as CustomCircuitInputs;

  const customOutputs_ = scene.objects.get(scene.customCircuitOutputs);
  if (customOutputs_ == null) {
    throw Error();
  }
  const customOutputs = (customOutputs_ as CircuitSceneObject)
    .parentCircuit as CustomCircuitOutputs;

  return new CustomCircuit(customInputs, customOutputs);
};

export let creators: Map<string, () => Circuit> = new Map([
  [
    "Input",
    () => {
      return new InputCircuit(false);
    },
  ],
  [
    "CustomCircuitInputs",
    () => {
      return new CustomCircuitInputs();
    },
  ],
  [
    "CustomCircuitOutputs",
    () => {
      return new CustomCircuitOutputs();
    },
  ],

  [
    "And",
    () => {
      return new ProcessingCircuit(2, 1, (self) => {
        self.producerPins[0].setValue(
          self.consumerPins[0].value && self.consumerPins[1].value
        );
      });
    },
  ],
  [
    "Or",
    () => {
      return new ProcessingCircuit(2, 1, (self) => {
        self.producerPins[0].setValue(
          self.consumerPins[0].value || self.consumerPins[1].value
        );
      });
    },
  ],
  [
    "Not",
    () => {
      return new ProcessingCircuit(1, 1, (self) => {
        self.producerPins[0].setValue(!self.consumerPins[0].value);
      });
    },
  ],
  [
    "Nand",
    () => {
      return new ProcessingCircuit(2, 1, (self) => {
        self.producerPins[0].setValue(
          !(self.consumerPins[0].value && self.consumerPins[1].value)
        );
      });
    },
  ],
  [
    "Nor",
    () => {
      return new ProcessingCircuit(2, 1, (self) => {
        self.producerPins[0].setValue(
          !(self.consumerPins[0].value || self.consumerPins[1].value)
        );
      });
    },
  ],
]);
