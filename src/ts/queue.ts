import { domLog } from "./main.js";

export class Queue<T> {
  private items = new Array<T>();
  private head: number | undefined = undefined;
  private tail: number | undefined = undefined;

  private resize(newSize: number) {
    if (newSize < this.items.length) {
      domLog("[Queue] newSize < this.items.length");
      throw Error();
    }

    let newItems = new Array<T>(newSize);
    if (this.head == null || this.tail == null) {
      this.items = newItems;
      return;
    }

    if (this.head === this.tail) {
      newItems[0] = this.items[this.head];
      this.head = 0;
      this.tail = 0;
      this.items = newItems;
      return;
    }

    const tail = this.tail;

    for (
      let newIdx = 0, oldIdx = this.head;
      oldIdx != (tail + 1) % this.items.length;
      newIdx++, oldIdx = (oldIdx + 1) % this.items.length
    ) {
      newItems[newIdx] = this.items[oldIdx];
      this.tail = newIdx;
    }

    this.head = 0;
    this.items = newItems;
  }

  enqueue(item: T) {
    if (this.isFull()) {
      this.resize(this.items.length * 2 + 1);
    }

    if (this.head == null || this.tail == null) {
      this.head = 0;
      this.tail = 0;
      this.items[this.tail] = item;
    } else {
      this.tail = (this.tail + 1) % this.items.length;
      this.items[this.tail] = item;
    }
    console.log("Enqueued: ", item);
    console.log("Queue: ", this);
  }

  dequeue() {
    if (this.head == null || this.tail == null) {
      return undefined;
    } else if (this.head === this.tail) {
      const result = this.items[this.head];
      delete this.items[this.head];
      this.head = undefined;
      this.tail = undefined;
      return result;
    } else {
      const result = this.items[this.head];
      this.head = (this.head + 1) % this.items.length;
      return result;
    }
  }

  isFull() {
    if (this.head == null || this.tail == null) {
      return false;
    }

    return (this.tail + 1) % this.items.length === this.head;
  }

  isEmpty() {
    return this.head == null;
  }
}
