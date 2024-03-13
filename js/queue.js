class Node {
    constructor(data, next = undefined) {
        this.data = data;
        this.next = next;
    }
}
export class Queue {
    enqueue(item) {
        if (this.tail == null) {
            this.head = new Node(item);
            this.tail = this.head;
        }
        else {
            this.tail.next = new Node(item);
            this.tail = this.tail.next;
        }
    }
    dequeue() {
        if (this.head == null) {
            return;
        }
        const result = this.head.data;
        this.head = this.head.next;
        if (this.head == null) {
            this.tail = undefined;
        }
        return result;
    }
    isEmpty() {
        return this.head == null;
    }
}
