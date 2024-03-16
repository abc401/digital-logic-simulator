import { clipboard, sceneManager } from "../main.js";
export function copySelectedToClipboard() {
    let clonedCircuits = new Array();
    let clonedWires = new Array();
    let circuitCloneMapping = new Map();
    let wireCloneMapping = new Map();
    for (let circuit of sceneManager.selectedCircuits) {
        cloneGraphAfterCircuit(circuit.parentCircuit, clonedCircuits, clonedWires, circuitCloneMapping, wireCloneMapping);
    }
    clipboard.circuits = clonedCircuits;
    clipboard.wires = clonedWires;
    console.log("Clipboard: ", clipboard);
}
export function pasteFromClipboard() {
    let clonedCircuits = new Array();
    let clonedWires = new Array();
    let circuitCloneMapping = new Map();
    let wireCloneMapping = new Map();
    for (let circuit of clipboard.circuits) {
        cloneGraphAfterCircuit(circuit, clonedCircuits, clonedWires, circuitCloneMapping, wireCloneMapping);
    }
    for (let circuit of clonedCircuits) {
        if (circuit.sceneObject == null) {
            throw Error();
        }
        circuit.configSceneObject(circuit.sceneObject.tightRectWrl.xy);
    }
}
export function cloneGraphAfterCircuit(start, clonedCircuits, clonedWires, circuitCloneMapping, wireCloneMapping) {
    const tmp = circuitCloneMapping.get(start);
    if (tmp != null) {
        return tmp;
    }
    let circuit = start;
    let cloned = circuit.clone();
    clonedCircuits.push(cloned);
    circuitCloneMapping.set(circuit, cloned);
    for (let pPinIdx = 0; pPinIdx < circuit.producerPins.length; pPinIdx++) {
        for (let wireIdx = 0; wireIdx < circuit.producerPins[pPinIdx].wires.length; wireIdx++) {
            console.log("[cloneCircuitTree] pPinIdx: ", pPinIdx);
            console.log("[cloneCircuitTree] circuit: ", circuit);
            console.log("[cloneCircuitTree] cloned: ", cloned);
            cloned.producerPins[pPinIdx].wires[wireIdx] = cloneGraphAfterWire(circuit.producerPins[pPinIdx].wires[wireIdx], clonedCircuits, clonedWires, circuitCloneMapping, wireCloneMapping);
        }
    }
    return cloned;
}
function cloneGraphAfterWire(start, clonedCircuits, clonedWires, circuitCloneMapping, wireCloneMapping) {
    const tmp = wireCloneMapping.get(start);
    if (tmp != null) {
        return tmp;
    }
    let wire = start;
    let cloned = wire.clone();
    clonedWires.push(cloned);
    wireCloneMapping.set(wire, cloned);
    if (wire.consumerPin != null) {
        let consumerCircuit = cloneGraphAfterCircuit(wire.consumerPin.parentCircuit, clonedCircuits, clonedWires, circuitCloneMapping, wireCloneMapping);
        console.log("[cloneCircuitTree] [Wire] id: ", start.id);
        console.log("[cloneCircuitTree] [Wire] wire: ", wire);
        console.log("[cloneCircuitTree] [Wire] cloned: ", cloned);
        cloned.setConsumerPinNoUpdate(consumerCircuit.consumerPins[wire.consumerPin.pinIndex]);
    }
    if (wire.producerPin != null) {
        let producerCircuit = cloneGraphAfterCircuit(wire.producerPin.parentCircuit, clonedCircuits, clonedWires, circuitCloneMapping, wireCloneMapping);
        cloned.setProducerPinNoUpdate(producerCircuit.producerPins[wire.producerPin.pinIndex]);
    }
    return cloned;
}
