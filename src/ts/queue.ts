class QueueNode<T> {
  item: T;
  next: QueueNode<T> | undefined = undefined;

  constructor(item: T) {
    this.item = item;
  }
}
export class Queue<T> {
  private head: QueueNode<T> | undefined = undefined;
  private tail: QueueNode<T> | undefined = undefined;

  enqueue(item: T) {
    // console.log("Enqueueing: ", item);
    if (this.head == null && this.tail == null) {
      this.head = new QueueNode(item);
      this.tail = this.head;
    } else if (this.head != null && this.tail != null) {
      this.tail.next = new QueueNode(item);
      this.tail = this.tail.next;
    } else if (this.head == null) {
      // console.debug("Queue: ", this);
      throw Error("Queue: Head was null but not tail!");
    } else {
      // console.debug("Queue: ", this);
      throw Error("Queue: Tail was null but not head!");
    }
  }

  dequeue() {
    if (this.head == null) {
      // console.log("Dequeueing: ", undefined);
      return undefined;
    }
    let node = this.head;
    this.head = this.head.next;
    if (this.head == null) {
      this.tail = undefined;
    }
    // console.log("Dequeueing: ", node.item);
    return node.item;
  }

  isEmpty() {
    return this.head == null;
  }
}
