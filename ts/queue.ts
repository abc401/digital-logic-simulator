export class Queue<T> {
  readonly items = new Array<T>();
  private head = 0;
  private tail = 0;

  private resize(newSize: number) {
    let newItems = new Array<T>(newSize);
    for (
      let newIdx = 0, oldIdx = this.head;
      newIdx < this.items.length;
      newIdx++, oldIdx = (oldIdx + 1) % this.items.length
    ) {
      newItems[newIdx] = this.items[oldIdx];
    }
    this.head = 0;
    this.tail = this.items.length;
  }

  enqueue(item: T) {
    if (this.isFull()) {
      this.resize(this.items.length * 2);
    }

    this.items[this.tail] = item;
    this.tail = (this.tail + 1) % this.items.length;
  }

  dequeue() {
    if (this.isEmpty()) {
      return undefined;
    }
    let result = this.items[this.head];
    this.head = (this.head + 1) % this.items.length;
    return result;
  }

  isFull() {
    return (this.tail + 1) % this.items.length === this.head;
  }
  isEmpty() {
    return this.head == this.tail;
  }
}
