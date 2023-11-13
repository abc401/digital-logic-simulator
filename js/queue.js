import { SHOULD_DEBUG } from "./main.js";
var QueueNode = /** @class */ (function () {
    function QueueNode(item) {
        this.next = undefined;
        this.item = item;
    }
    return QueueNode;
}());
var Queue = /** @class */ (function () {
    function Queue() {
        this.head = undefined;
        this.tail = undefined;
    }
    Queue.prototype.enqueue = function (item) {
        if (SHOULD_DEBUG)
            console.log("Enqueueing: ", item);
        if (this.head == null && this.tail == null) {
            this.head = new QueueNode(item);
            this.tail = this.head;
        }
        else if (this.head != null && this.tail != null) {
            this.tail.next = new QueueNode(item);
            this.tail = this.tail.next;
        }
        else if (this.head == null) {
            if (SHOULD_DEBUG)
                console.debug("Queue: ", this);
            throw Error("Queue: Head was null but not tail!");
        }
        else {
            if (SHOULD_DEBUG)
                console.debug("Queue: ", this);
            throw Error("Queue: Tail was null but not head!");
        }
    };
    Queue.prototype.dequeue = function () {
        if (this.head == null) {
            if (SHOULD_DEBUG)
                console.log("Dequeueing: ", undefined);
            return undefined;
        }
        var node = this.head;
        this.head = this.head.next;
        if (this.head == null) {
            this.tail = undefined;
        }
        if (SHOULD_DEBUG) {
            console.log("Dequeueing: ", node.item);
        }
        return node.item;
    };
    Queue.prototype.isEmpty = function () {
        return this.head == null;
    };
    return Queue;
}());
export { Queue };
