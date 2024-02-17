import { viewManager } from "./main.js";
export var ConcreteObjectKind;
(function (ConcreteObjectKind) {
    ConcreteObjectKind["Circuit"] = "Circuit";
    ConcreteObjectKind["Wire"] = "Wire";
    ConcreteObjectKind["ConsumerPin"] = "ConsumerPin";
    ConcreteObjectKind["ProducerPin"] = "ProducerPin";
})(ConcreteObjectKind || (ConcreteObjectKind = {}));
export class VirtualObject {
    constructor(kind, concreteObject, boundingBoxWrl) {
        this.kind = kind;
        this.concreteObject = concreteObject;
        this.boundingBoxWrl = boundingBoxWrl;
    }
}
export class SceneManager {
    constructor() {
        this.circuits = new Map();
        this.wires = new Map();
        this.consumerPins = new Map();
        this.producerPins = new Map();
        this.objects = new Map();
        this.currentID = 0;
    }
    register(object) {
        const id = this.currentID;
        this.currentID += 1;
        this.objects.set(id, object);
        if (object.kind === ConcreteObjectKind.Circuit) {
            this.circuits.set(id, object.concreteObject);
        }
        else if (object.kind === ConcreteObjectKind.ConsumerPin) {
            this.consumerPins.set(id, object.concreteObject);
        }
        else if (object.kind === ConcreteObjectKind.ProducerPin) {
            this.producerPins.set(id, object.concreteObject);
        }
        else {
            this.wires.set(id, object.concreteObject);
        }
        console.log("Objects: ", this.objects);
        return id;
    }
    unregister(id) {
        const object = this.objects.get(id);
        if (object == null) {
            return;
        }
        this.objects.delete(id);
        if (object.kind === ConcreteObjectKind.Circuit) {
            this.circuits.delete(id);
        }
        else if (object.kind === ConcreteObjectKind.Wire) {
            this.wires.delete(id);
        }
        else if (object.kind === ConcreteObjectKind.ConsumerPin) {
            this.consumerPins.delete(id);
        }
        else {
            this.producerPins.delete(id);
        }
        console.log("Objects: ", this.objects);
    }
    getObjectAt(locScr) {
        for (let object of this.objects.values()) {
            if (object.boundingBoxWrl.pointIntersection(viewManager.screenToWorld(locScr))) {
                // console.log(`${object.kind}: `, object.concreteObject);
                return object;
            }
        }
    }
}
