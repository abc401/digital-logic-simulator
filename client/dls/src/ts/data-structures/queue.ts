class Node<T> {
	constructor(
		public data: T,
		public next: Node<T> | undefined = undefined
	) {}
}

export class Queue<T> {
	private head: Node<T> | undefined;
	private tail: Node<T> | undefined;

	enqueue(item: T) {
		if (this.tail == null) {
			this.head = new Node(item);
			this.tail = this.head;
		} else {
			this.tail.next = new Node(item);
			this.tail = this.tail.next;
		}
		console.log('Queue: ', this);
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
